// Security rules tests. Run with `npm run test:rules` (needs Java for the
// Firestore emulator).
import { readFileSync } from "node:fs";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import {
  arrayRemove,
  arrayUnion,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  writeBatch,
  type Firestore,
} from "firebase/firestore";
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";

let env: RulesTestEnvironment;

const user = (username: string, extra = {}) => ({
  email: `${username}@example.com`,
  username,
  usernameLower: username.toLowerCase(),
  follower: [],
  following: [],
  likes: [],
  comments: [],
  profilePic: "",
  ...extra,
});

const as = (username: string, emailVerified = true): Firestore =>
  env
    .authenticatedContext(`${username}-uid`, {
      email: `${username}@example.com`,
      email_verified: emailVerified,
    })
    .firestore() as unknown as Firestore;
const guest = (): Firestore => env.unauthenticatedContext().firestore() as unknown as Firestore;

const pic = "data:image/webp;base64,UklGRhYAAABXRUJQVlA4";

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: "demo-instapets",
    firestore: { rules: readFileSync("firestore.rules", "utf8") },
  });
});

afterAll(() => env.cleanup());

beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await setDoc(doc(db, "users/alice"), user("alice", { comments: ["c1"] }));
    await setDoc(doc(db, "users/bob"), user("bob"));
    await setDoc(doc(db, "posts/p1"), {
      id: "p1",
      user: "alice",
      userPic: "",
      caption: "hi",
      urlPic: "",
      likes: [],
      created: 1,
    });
    await setDoc(doc(db, "images/p1"), { owner: "alice", src: pic });
    await setDoc(doc(db, "comments/c1"), {
      commentId: "c1",
      postId: "p1",
      text: "nice",
      username: "bob",
      userPic: "",
      created: 2,
    });
  });
});

describe("reading", () => {
  it("lets guests read everything", async () => {
    for (const path of ["users/alice", "posts/p1", "images/p1", "comments/c1"]) {
      await assertSucceeds(getDoc(doc(guest(), path)));
    }
  });
});

describe("users", () => {
  it("lets you create your own profile", async () => {
    await assertSucceeds(setDoc(doc(as("carol"), "users/carol"), user("carol")));
  });

  it("lets you create your profile before verifying your email", async () => {
    await assertSucceeds(
      setDoc(doc(as("carol", false), "users/carol"), user("carol")),
    );
  });

  it("rejects profiles for someone else's email, with followers, or a wrong search name", async () => {
    await assertFails(setDoc(doc(as("carol"), "users/dave"), user("dave")));
    await assertFails(
      setDoc(doc(as("carol"), "users/carol"), user("carol", { follower: ["bob"] })),
    );
    await assertFails(
      setDoc(doc(as("carol"), "users/carol"), user("carol", { usernameLower: "bob" })),
    );
    await assertFails(
      setDoc(doc(as("carol"), "users/carol"), user("carol", { junk: "x".repeat(500_000) })),
    );
  });

  it("rejects guests editing profiles", async () => {
    await assertFails(updateDoc(doc(guest(), "users/alice"), { profilePic: pic }));
  });

  it("lets you set a data URL profile picture, but not a link", async () => {
    await assertSucceeds(updateDoc(doc(as("alice"), "users/alice"), { profilePic: pic }));
    await assertFails(
      updateDoc(doc(as("alice"), "users/alice"), { profilePic: "https://evil.example/x.png" }),
    );
    await assertFails(
      updateDoc(doc(as("alice"), "users/alice"), {
        profilePic: "data:image/webp;base64," + "A".repeat(100_000),
      }),
    );
  });

  it("rejects editing someone else's profile", async () => {
    await assertFails(updateDoc(doc(as("bob"), "users/alice"), { profilePic: pic }));
  });

  it("lets you follow and unfollow", async () => {
    const db = as("bob");
    const follow = writeBatch(db);
    follow.update(doc(db, "users/bob"), { following: arrayUnion("alice") });
    follow.update(doc(db, "users/alice"), { follower: arrayUnion("bob") });
    await assertSucceeds(follow.commit());

    const unfollow = writeBatch(db);
    unfollow.update(doc(db, "users/bob"), { following: arrayRemove("alice") });
    unfollow.update(doc(db, "users/alice"), { follower: arrayRemove("bob") });
    await assertSucceeds(unfollow.commit());
  });

  it("rejects adding someone else as a follower", async () => {
    await assertFails(
      updateDoc(doc(as("bob"), "users/alice"), { follower: arrayUnion("carol") }),
    );
    await assertFails(
      updateDoc(doc(as("alice"), "users/alice"), { follower: arrayUnion("bob") }),
    );
  });
});

describe("posts and pictures", () => {
  const newPost = (
    db: Firestore,
    owner: string,
    author = owner,
    fields: Record<string, unknown> = {},
  ) => {
    const batch = writeBatch(db);
    batch.set(doc(db, "images/p2"), { owner, src: pic });
    batch.set(doc(db, "posts/p2"), {
      id: "p2",
      user: author,
      userPic: "",
      caption: "",
      urlPic: "",
      likes: [],
      created: Date.now(),
      ...fields,
    });
    return batch.commit();
  };

  it("lets you post a picture", async () => {
    await assertSucceeds(newPost(as("bob"), "bob"));
  });

  it("allows captions up to 2200 characters", async () => {
    await assertSucceeds(
      newPost(as("bob"), "bob", "bob", { caption: "c".repeat(2200) }),
    );
  });

  it("rejects long captions, extra fields and backdated or future posts", async () => {
    const bob = as("bob");
    await assertFails(newPost(bob, "bob", "bob", { caption: "c".repeat(2201) }));
    await assertFails(newPost(bob, "bob", "bob", { junk: "x".repeat(500_000) }));
    await assertFails(newPost(bob, "bob", "bob", { created: Date.now() + 3_600_000 }));
    await assertFails(newPost(bob, "bob", "bob", { created: 1 }));
    await assertFails(newPost(bob, "bob", "bob", { userPic: "https://evil.example" }));
  });

  it("rejects posting as someone else", async () => {
    await assertFails(newPost(as("bob"), "alice"));
    await assertFails(newPost(as("bob"), "bob", "alice"));
  });

  it("rejects a picture without a post, or an oversized one", async () => {
    await assertFails(setDoc(doc(as("bob"), "images/p3"), { owner: "bob", src: pic }));
    const db = as("bob");
    const batch = writeBatch(db);
    batch.set(doc(db, "images/p2"), { owner: "bob", src: "x".repeat(800_000) });
    batch.set(doc(db, "posts/p2"), {
      id: "p2",
      user: "bob",
      userPic: "",
      caption: "",
      urlPic: "",
      likes: [],
      created: Date.now(),
    });
    await assertFails(batch.commit());
  });

  it("lets you like and unlike", async () => {
    const db = as("bob");
    const like = writeBatch(db);
    like.update(doc(db, "posts/p1"), { likes: arrayUnion("bob") });
    like.update(doc(db, "users/bob"), { likes: arrayUnion("p1") });
    await assertSucceeds(like.commit());
    await assertSucceeds(updateDoc(doc(db, "posts/p1"), { likes: arrayRemove("bob") }));
  });

  it("rejects liking on someone else's behalf or editing captions", async () => {
    await assertFails(updateDoc(doc(as("bob"), "posts/p1"), { likes: arrayUnion("carol") }));
    await assertFails(updateDoc(doc(as("bob"), "posts/p1"), { caption: "hacked" }));
  });

  it("lets the author delete a post with its comments and picture", async () => {
    const db = as("alice");
    const batch = writeBatch(db);
    batch.delete(doc(db, "comments/c1"));
    batch.delete(doc(db, "images/p1"));
    batch.delete(doc(db, "posts/p1"));
    await assertSucceeds(batch.commit());
  });

  it("rejects deleting someone else's post or picture", async () => {
    await assertFails(deleteDoc(doc(as("bob"), "posts/p1")));
    await assertFails(deleteDoc(doc(as("bob"), "images/p1")));
  });
});

describe("comments", () => {
  it("lets you comment as yourself", async () => {
    const db = as("bob");
    const batch = writeBatch(db);
    batch.set(doc(db, "comments/c2"), {
      commentId: "c2",
      postId: "p1",
      text: "wow",
      username: "bob",
      userPic: "",
      created: Date.now(),
    });
    batch.update(doc(db, "users/bob"), { comments: arrayUnion("c2") });
    await assertSucceeds(batch.commit());
  });

  it("rejects empty, long or padded comments", async () => {
    const comment = (fields: Record<string, unknown>) =>
      setDoc(doc(as("bob"), "comments/c2"), {
        commentId: "c2",
        postId: "p1",
        text: "wow",
        username: "bob",
        userPic: "",
        created: Date.now(),
        ...fields,
      });
    await assertSucceeds(comment({ text: "c".repeat(1000) }));
    await assertFails(comment({ text: "" }));
    await assertFails(comment({ text: "c".repeat(1001) }));
    await assertFails(comment({ junk: true }));
    await assertFails(comment({ created: Date.now() + 3_600_000 }));
  });

  it("rejects commenting as someone else", async () => {
    await assertFails(
      setDoc(doc(as("bob"), "comments/c2"), {
        commentId: "c2",
        postId: "p1",
        text: "wow",
        username: "alice",
        userPic: "",
        created: Date.now(),
      }),
    );
  });

  it("lets the author delete their comment, but not others", async () => {
    await assertFails(deleteDoc(doc(as("carol"), "comments/c1")));
    await assertSucceeds(deleteDoc(doc(as("bob"), "comments/c1")));
  });
});

describe("unverified email", () => {
  it("rejects posting, liking, commenting, following and profile edits", async () => {
    const db = as("bob", false);
    const post = writeBatch(db);
    post.set(doc(db, "images/p2"), { owner: "bob", src: pic });
    post.set(doc(db, "posts/p2"), {
      id: "p2",
      user: "bob",
      userPic: "",
      caption: "",
      urlPic: "",
      likes: [],
      created: Date.now(),
    });
    await assertFails(post.commit());
    await assertFails(updateDoc(doc(db, "posts/p1"), { likes: arrayUnion("bob") }));
    await assertFails(
      setDoc(doc(db, "comments/c2"), {
        commentId: "c2",
        postId: "p1",
        text: "wow",
        username: "bob",
        userPic: "",
        created: Date.now(),
      }),
    );
    await assertFails(updateDoc(doc(db, "users/alice"), { follower: arrayUnion("bob") }));
    await assertFails(updateDoc(doc(db, "users/bob"), { profilePic: pic }));
  });

  it("still lets you delete your account", async () => {
    await assertSucceeds(deleteDoc(doc(as("bob", false), "users/bob")));
  });
});

describe("account deletion", () => {
  it("lets a deleted user remove themselves from others' following", async () => {
    await env.withSecurityRulesDisabled((context) =>
      setDoc(doc(context.firestore(), "users/alice"), user("alice", { following: ["bob"] })),
    );
    await assertSucceeds(
      updateDoc(doc(as("bob"), "users/alice"), { following: arrayRemove("bob") }),
    );
  });
});
