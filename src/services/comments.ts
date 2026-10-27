import {
  arrayRemove,
  arrayUnion,
  doc,
  getDocs,
  query,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase/config";
import type { PostComment, UserProfile } from "../types";
import { commentsCol, usersCol } from "./collections";

// oldest first
export async function getComments(postId: string): Promise<PostComment[]> {
  // sorted here rather than with orderBy, which would need a composite index
  const snapshot = await getDocs(
    query(commentsCol, where("postId", "==", postId)),
  );
  return snapshot.docs
    .map((d) => d.data())
    .sort((a, b) => a.created - b.created);
}

export async function addComment(
  postId: string,
  text: string,
  author: UserProfile,
): Promise<void> {
  const commentId = crypto.randomUUID();
  const batch = writeBatch(db);
  batch.set(doc(commentsCol, commentId), {
    commentId,
    postId,
    text,
    username: author.username,
    userPic: author.profilePic,
    created: Date.now(),
  });
  batch.update(doc(usersCol, author.username), {
    comments: arrayUnion(commentId),
  });
  await batch.commit();
}

export async function deleteComment(
  commentId: string,
  username: string,
): Promise<void> {
  const batch = writeBatch(db);
  batch.delete(doc(commentsCol, commentId));
  batch.update(doc(usersCol, username), { comments: arrayRemove(commentId) });
  await batch.commit();
}
