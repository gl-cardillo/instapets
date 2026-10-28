import {
  arrayRemove,
  arrayUnion,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase/config";
import type { Post, UserProfile } from "../types";
import { compressImage } from "../utils/image";
import { commentsCol, imagesCol, postsCol, usersCol } from "./collections";
import { forgetPostImage } from "./images";

export interface FeedPage {
  posts: Post[];
  // pass to getFeed for the next page; null when there are no more
  next: number | null;
}

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

export async function getPostsByUser(username: string): Promise<Post[]> {
  const snapshot = await getDocs(query(postsCol, where("user", "==", username)));
  return snapshot.docs.map((d) => d.data());
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
  // the post doc is deleted last: security rules look it up to authorize
  // deleting its comments
  const batch = writeBatch(db);
  comments.docs.forEach((d) => batch.delete(d.ref));
  // older posts have no image doc, and rules reject deleting a missing one
  if (image.exists()) batch.delete(image.ref);
  batch.delete(doc(postsCol, id));
  await batch.commit();
  forgetPostImage(id);
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
