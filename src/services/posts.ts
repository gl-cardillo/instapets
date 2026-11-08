import {
  arrayRemove,
  arrayUnion,
  doc,
  getDoc,
  getCountFromServer,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase/config";
import type { Post, UserProfile } from "../types";
import { chunks, mergeNewest, type FeedPage } from "../utils/feed";
import { compressImage } from "../utils/image";
import { commentsCol, imagesCol, postsCol, usersCol } from "./collections";
import { forgetPostImage } from "./images";

// newest first, `pageSize` at a time
export async function getFeed(
  after: number | null = null,
  pageSize = 10,
): Promise<FeedPage> {
  const snapshot = await getDocs(
    query(
      postsCol,
      orderBy("created", "desc"),
      ...(after === null ? [] : [startAfter(after)]),
      limit(pageSize),
    ),
  );
  const posts = snapshot.docs.map((d) => d.data());
  return {
    posts,
    next: posts.length === pageSize ? posts[posts.length - 1].created : null,
  };
}

// posts by `usernames`, newest first; needs the posts (user, created) index
export async function getFollowingFeed(
  usernames: string[],
  after: number | null = null,
  pageSize = 10,
): Promise<FeedPage> {
  const pages = await Promise.all(
    chunks(usernames).map(async (group) => {
      const snapshot = await getDocs(
        query(
          postsCol,
          where("user", "in", group),
          orderBy("created", "desc"),
          ...(after === null ? [] : [startAfter(after)]),
          limit(pageSize),
        ),
      );
      return snapshot.docs.map((d) => d.data());
    }),
  );
  return mergeNewest(pages, pageSize);
}

// newest first; uses the posts (user, created) index
export async function getPostsByUser(
  username: string,
  after: number | null = null,
  pageSize = 12,
): Promise<FeedPage> {
  const snapshot = await getDocs(
    query(
      postsCol,
      where("user", "==", username),
      orderBy("created", "desc"),
      ...(after === null ? [] : [startAfter(after)]),
      limit(pageSize),
    ),
  );
  return mergeNewest([snapshot.docs.map((d) => d.data())], pageSize);
}

// about one read, however many posts there are
export async function countPostsByUser(username: string): Promise<number> {
  const snapshot = await getCountFromServer(
    query(postsCol, where("user", "==", username)),
  );
  return snapshot.data().count;
}

export async function getPost(id: string): Promise<Post | null> {
  const snapshot = await getDoc(doc(postsCol, id));
  return snapshot.exists() ? snapshot.data() : null;
}

export async function addPost(
  pic: File,
  author: UserProfile,
  caption: string,
): Promise<void> {
  const src = await compressImage(pic, 1080, 700_000);
  const id = crypto.randomUUID();
  const batch = writeBatch(db);
  batch.set(doc(imagesCol, id), { owner: author.username, src });
  batch.set(doc(postsCol, id), {
    id,
    user: author.username,
    userPic: "",
    caption,
    urlPic: "",
    likes: [],
    created: Date.now(),
  });
  await batch.commit();
}

export async function deletePost(id: string): Promise<void> {
  const [comments, image] = await Promise.all([
    getDocs(query(commentsCol, where("postId", "==", id))),
    getDoc(doc(imagesCol, id)),
  ]);
  // post goes last: rules check it before deleting comments
  const batch = writeBatch(db);
  comments.docs.forEach((d) => batch.delete(d.ref));
  // old posts have no image doc
  if (image.exists()) batch.delete(image.ref);
  batch.delete(doc(postsCol, id));
  await batch.commit();
  forgetPostImage(id);
}

export async function updateCaption(
  postId: string,
  caption: string,
): Promise<void> {
  await updateDoc(doc(postsCol, postId), { caption });
}

// likes or unlikes the post and returns it with the updated likes
export async function toggleLike(post: Post, username: string): Promise<Post> {
  const liked = post.likes.includes(username);
  const batch = writeBatch(db);
  batch.update(doc(postsCol, post.id), {
    likes: liked ? arrayRemove(username) : arrayUnion(username),
  });
  batch.update(doc(usersCol, username), {
    likes: liked ? arrayRemove(post.id) : arrayUnion(post.id),
  });
  await batch.commit();
  return {
    ...post,
    likes: liked
      ? post.likes.filter((name) => name !== username)
      : [...post.likes, username],
  };
}
