import {
  arrayRemove,
  arrayUnion,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { savesCol } from "./collections";

// oldest saved first
export async function getSavedIds(username: string): Promise<string[]> {
  const snapshot = await getDoc(doc(savesCol, username));
  return snapshot.exists() ? snapshot.data().posts : [];
}

export async function setSaved(
  username: string,
  postId: string,
  saved: boolean,
): Promise<void> {
  // merge creates the doc on the first save
  await setDoc(
    doc(savesCol, username),
    { posts: saved ? arrayUnion(postId) : arrayRemove(postId) },
    { merge: true },
  );
}

export async function deleteSaved(username: string): Promise<void> {
  await deleteDoc(doc(savesCol, username));
}
