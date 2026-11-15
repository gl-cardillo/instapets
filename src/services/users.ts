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
import {
  EmailAuthProvider,
  deleteUser,
  reauthenticateWithCredential,
} from "firebase/auth";
import { auth, db } from "../firebase/config";
import type { PetDetails, UserProfile } from "../types";
import { compressImage } from "../utils/image";
import { rankResults, searchTermsFor } from "../utils/search";
import { rankSuggestions } from "../utils/suggest";
import { commentsCol, postsCol, usersCol } from "./collections";
import { deletePost, getFeed } from "./posts";
import { deleteSaved } from "./saves";

async function fetchUser(username: string): Promise<UserProfile | null> {
  const snapshot = await getDoc(doc(usersCol, username));
  return snapshot.exists() ? snapshot.data() : null;
}

// cached per visit; call forgetUser after a change
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
  const byPrefix = getDocs(
    query(
      usersCol,
      where("usernameLower", ">=", prefix),
      where("usernameLower", "<=", prefix + ""),
      limit(max),
    ),
  );
  // users without searchTerms yet are still found by prefix
  const inside =
    prefix.length < 2
      ? null
      : getDocs(
          query(
            usersCol,
            where("searchTerms", "array-contains", prefix),
            limit(max),
          ),
        );
  const results = await Promise.all([byPrefix, inside]);
  const users = results.flatMap((s) => s?.docs.map((d) => d.data()) ?? []);
  return rankResults(users, prefix, max);
}

// adds search fragments to users who signed up before they existed
export async function addSearchTerms(username: string): Promise<void> {
  await updateDoc(doc(usersCol, username), {
    searchTerms: searchTermsFor(username),
  });
  forgetUser(username);
}

// pets to follow, see rankSuggestions
export async function suggestPets(
  me: UserProfile,
  max = 6,
): Promise<UserProfile[]> {
  const [follows, feed] = await Promise.all([
    getUsers(me.following.slice(0, 10)),
    getFeed(null, 20),
  ]);
  const names = rankSuggestions(
    me,
    follows,
    feed.posts.map((post) => post.user),
    max,
  );
  return getUsers(names);
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
    // auth lowercases emails, and profiles are found by them
    email: email.toLowerCase(),
    username,
    usernameLower: username.toLowerCase(),
    follower: [],
    following: [],
    likes: [],
    comments: [],
    profilePic: "",
    bio: "",
    pet: {},
    searchTerms: searchTermsFor(username),
  });
  forgetUser(username);
}

// replaces all the pet details at once
export async function updatePetDetails(
  username: string,
  pet: PetDetails,
): Promise<void> {
  await updateDoc(doc(usersCol, username), { pet });
  forgetUser(username);
}

export async function updateBio(username: string, bio: string): Promise<void> {
  await updateDoc(doc(usersCol, username), { bio });
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

// deletes everything, checking the password first so a typo deletes nothing
export async function deleteAccount(
  username: string,
  password: string,
): Promise<void> {
  const user = auth.currentUser;
  if (!user?.email) throw new Error("Not signed in");
  await reauthenticateWithCredential(
    user,
    EmailAuthProvider.credential(user.email, password),
  );

  const profile = await fetchUser(username);
  if (!profile) throw new Error(`User ${username} not found`);

  const posts = await getDocs(query(postsCol, where("user", "==", username)));
  await Promise.all(posts.docs.map((d) => deletePost(d.id)));

  // best effort: some may already be gone
  await Promise.allSettled([
    ...profile.likes.map((postId) =>
      updateDoc(doc(postsCol, postId), { likes: arrayRemove(username) }),
    ),
    ...profile.following.map((name) => toggleFollow(name, username, true)),
    ...profile.follower.map((name) => toggleFollow(username, name, true)),
    ...profile.comments.map((id) => deleteDoc(doc(commentsCol, id))),
    deleteSaved(username),
  ]);

  // rules check the profile and login, so they go last
  await deleteDoc(doc(usersCol, username));
  forgetUser(username);
  await deleteUser(user);
}
