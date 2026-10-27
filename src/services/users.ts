import {
  arrayRemove,
  arrayUnion,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { deleteUser } from "firebase/auth";
import { auth, db } from "../firebase/config";
import type { UserProfile } from "../types";
import { compressImage } from "../utils/image";
import { commentsCol, postsCol, usersCol } from "./collections";
import { deletePost } from "./posts";

export async function getAllUsers(): Promise<UserProfile[]> {
  const snapshot = await getDocs(usersCol);
  return snapshot.docs.map((d) => d.data());
}

export async function getUser(username: string): Promise<UserProfile | null> {
  const snapshot = await getDoc(doc(usersCol, username));
  return snapshot.exists() ? snapshot.data() : null;
}

export async function getUserByEmail(
  email: string,
): Promise<UserProfile | null> {
  const snapshot = await getDocs(query(usersCol, where("email", "==", email)));
  return snapshot.empty ? null : snapshot.docs[0].data();
}

export async function isUsernameTaken(username: string): Promise<boolean> {
  return (await getDoc(doc(usersCol, username))).exists();
}

export async function createUserProfile(
  email: string,
  username: string,
): Promise<void> {
  await setDoc(doc(usersCol, username), {
    // Firebase Auth lowercases emails, and profiles are looked up by it
    email: email.toLowerCase(),
    username,
    follower: [],
    following: [],
    likes: [],
    comments: [],
    profilePic: "",
  });
}

// `username` follows or unfollows `profileName`
export async function toggleFollow(
  profileName: string,
  username: string,
  isFollowing: boolean,
): Promise<void> {
  const batch = writeBatch(db);
  batch.update(doc(usersCol, username), {
    following: isFollowing ? arrayRemove(profileName) : arrayUnion(profileName),
  });
  batch.update(doc(usersCol, profileName), {
    follower: isFollowing ? arrayRemove(username) : arrayUnion(username),
  });
  await batch.commit();
}

export async function changeProfilePic(
  file: File,
  username: string,
): Promise<void> {
  const profilePic = await compressImage(file, 256, 60_000);
  await updateDoc(doc(usersCol, username), { profilePic });
}

// Deletes the signed-in user's posts, likes, follows, comments, profile and
// login.
export async function deleteAccount(username: string): Promise<void> {
  const profile = await getUser(username);
  if (!profile) throw new Error(`User ${username} not found`);

  const posts = await getDocs(query(postsCol, where("user", "==", username)));
  await Promise.all(posts.docs.map((d) => deletePost(d.id)));

  // best effort: some of these may point at posts or comments that are
  // already gone
  await Promise.allSettled([
    ...profile.likes.map((postId) =>
      updateDoc(doc(postsCol, postId), { likes: arrayRemove(username) }),
    ),
    ...profile.following.map((name) => toggleFollow(name, username, true)),
    ...profile.follower.map((name) => toggleFollow(username, name, true)),
    ...profile.comments.map((id) => deleteDoc(doc(commentsCol, id))),
  ]);

  // everything above is authorized against the profile and login, so they
  // go last
  const user = auth.currentUser;
  if (!user) throw new Error("Not signed in");
  await deleteDoc(doc(usersCol, username));
  await deleteUser(user);
}
