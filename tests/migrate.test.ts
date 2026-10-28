// Tests scripts/migrate.mjs against the Firestore emulator. Run with
// `npm run test:rules`.
import { deleteApp, initializeApp, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
// @ts-expect-error plain JS script without types
import { migrate } from "../scripts/migrate.mjs";

// a separate project from the rules tests, so they don't share data
let app: App;
let db: Firestore;

const user = (username: string, extra = {}) => ({
  email: `${username}@example.com`,
  username,
  follower: [],
  following: [],
  likes: [],
  comments: [],
  profilePic: "",
  ...extra,
});

const post = (id: string, owner: string, urlPic: string, likes: string[] = []) => ({
  id,
  user: owner,
  userPic: "",
  caption: "",
  urlPic,
  likes,
  created: 1,
});

beforeAll(() => {
  app = initializeApp({ projectId: "demo-migrate" }, "migrate-test");
  db = getFirestore(app);
});

afterAll(() => deleteApp(app));

beforeEach(async () => {
  await db.recursiveDelete(db.collection("users"));
  await db.recursiveDelete(db.collection("posts"));
  await db.recursiveDelete(db.collection("comments"));
  await Promise.all([
    db.doc("users/Alice").set(
      user("Alice", { likes: ["old", "new"], comments: ["c-old", "c-new"], follower: ["anon"] }),
    ),
    db.doc("users/anon").set(user("anon", { comments: ["c-anon"] })),
    db.doc("posts/old").set(post("old", "Alice", "https://firebasestorage.example/x")),
    db.doc("posts/new").set(post("new", "Alice", "", ["Alice", "anon"])),
    db.doc("comments/c-old").set({ commentId: "c-old", postId: "old", username: "Alice" }),
    db.doc("comments/c-new").set({ commentId: "c-new", postId: "new", username: "Alice" }),
    db.doc("comments/c-anon").set({ commentId: "c-anon", postId: "new", username: "anon" }),
  ]);
});

const ids = async (collection: string) =>
  (await db.collection(collection).get()).docs.map((d) => d.id).sort();

describe("migrate", () => {
  it("adds usernameLower and nothing else by default", async () => {
    await migrate(db, { log: () => {} });
    expect((await db.doc("users/Alice").get()).data()?.usernameLower).toBe("alice");
    expect(await ids("posts")).toEqual(["new", "old"]);
    expect(await ids("users")).toEqual(["Alice", "anon"]);
  });

  it("changes nothing in a dry run", async () => {
    await migrate(db, { removeLegacy: true, dryRun: true, log: () => {} });
    expect((await db.doc("users/Alice").get()).data()?.usernameLower).toBeUndefined();
    expect(await ids("posts")).toEqual(["new", "old"]);
  });

  it("removes legacy posts, the anon user and references to them", async () => {
    await migrate(db, { removeLegacy: true, log: () => {} });
    expect(await ids("posts")).toEqual(["new"]);
    expect(await ids("comments")).toEqual(["c-new"]);
    expect(await ids("users")).toEqual(["Alice"]);

    const alice = (await db.doc("users/Alice").get()).data();
    expect(alice?.usernameLower).toBe("alice");
    expect(alice?.likes).toEqual(["new"]);
    expect(alice?.comments).toEqual(["c-new"]);
    expect(alice?.follower).toEqual([]);
    expect((await db.doc("posts/new").get()).data()?.likes).toEqual(["Alice"]);
  });
});
