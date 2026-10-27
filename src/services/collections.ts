import {
  collection,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "../firebase/config";
import type { Post, PostComment, PostImage, UserProfile } from "../types";

// documents are stored exactly as typed, so the converter only adds typing
function converter<T extends DocumentData>() {
  return {
    toFirestore: (data: T) => data,
    fromFirestore: (snapshot: QueryDocumentSnapshot) => snapshot.data() as T,
  };
}

export const usersCol = collection(db, "users").withConverter(
  converter<UserProfile>(),
);
export const postsCol = collection(db, "posts").withConverter(
  converter<Post>(),
);
export const commentsCol = collection(db, "comments").withConverter(
  converter<PostComment>(),
);
export const imagesCol = collection(db, "images").withConverter(
  converter<PostImage>(),
);
