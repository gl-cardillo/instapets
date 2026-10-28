import {
  arrayRemove,
  arrayUnion,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
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

async function fetchUser(username: string): Promise<UserProfile | null> {
  const snapshot = await getDoc(doc(usersCol, username));
  return snapshot.exists() ? snapshot.data() : null;
}

// Profiles are read at most once per visit, since avatars and names show up
// all over the page. Call forgetUser after changing one.
const cache = new Map<string, Promise<UserProfile | null>>();

export function getUser(username: string): Promise<UserProfile | null> {
  let user = cache.get(username);
  if (!user) {
    user = fetchUser(username);
    // don't cache failures, so they're retried
    user.catch(() => cache.delete(username));
    cache.set(username, user);
  }
  return user;
}

export function forgetUser(...usernames: string[]): void {
  usernames.forEach((username) => cache.delete(username));
}

// the existing ones among `usernames`, in the same order
export async function getUsers(usernames: string[]): Promise<UserProfile[]> {
  const users = await Promise.all([...new Set(usernames)].map(getUser));
  return users.filter((user) => user !== null);
}

// users whose name starts with `text`, ignoring case
export async function searchUsers(
  text: string,
  max: number,
): Promise<UserProfile[]> {
  const prefix = text.toLowerCase().trim();
  if (!prefix) return [];
  const snapshot = await getDocs(
    query(
      usersCol,
      where("usernameLower", ">=", prefix),
      where("usernameLower", "<=", prefix + ""),
      limit(max),
    ),
  );
  return snapshot.docs.map((d) => d.data());
}

export async function getUserByEmail(
  email: string,
): Promise<UserProfile | null> {
  const snapshot = await getDocs(query(usersCol, where("email", "==", email)));
  return snapshot.empty ? null : snapshot.docs[0].data();
}

export async function isUsernameTaken(username: string): Promise<boolean> {
  return (await fetchUser(username)) !== null;
}

export async function createUserProfile(
  email: string,
  username: string,
): Promise<void> {
  await setDoc(doc(usersCol, username), {
    // Firebase Auth lowercases emails, and profiles are looked up by it
    email: email.toLowerCase(),
    username,
    usernameLower: username.toLowerCase(),
    follower: [],
    following: [],
    likes: [],
    comments: [],
    profilePic: "",
  });
  forgetUser(username);
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
  forgetUser(profileName, username);
}

export async function changeProfilePic(
  file: File,
  username: string,
): Promise<void> {
  const profilePic = await compressImage(file, 256, 60_000);
  await updateDoc(doc(usersCol, username), { profilePic });
  forgetUser(username);
}

// Deletes the signed-in user's posts, likes, follows, comments, profile and
// login.
export async function deleteAccount(username: string): Promise<void> {
  const profile = await fetchUser(username);
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
  forgetUser(username);
  await deleteUser(user);
}
