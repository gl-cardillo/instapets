import { v4 as uuidv4 } from "uuid";
import { storage, db } from "../firebase/config";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  arrayUnion,
  arrayRemove,
  where,
  query,
  orderBy,
  setDoc,
  deleteDoc,
} from "firebase/firestore";

export async function getPostsData() {
  try {
    let reponse = [];
    const data = await getDocs(collection(db, "posts"));
    data.docs.map((doc) => reponse.push(doc.data()));
    return reponse;
  } catch (error) {
    console.log(error.message);
  }
}

export async function getDataByEmail(set, email = "anon@anon.com") {
  try {
    const q = query(collection(db, "users"), where("email", "==", email));
    const snapshot = await getDocs(q);
    snapshot.forEach((doc) => {
      set(doc.data());
    });
  } catch (error) {
    console.log(error.message);
  }
}

export async function getPostsUser(set, name) {
  try {
    let response = [];
    const q = query(collection(db, "posts"), where("user", "==", `${name}`));
    const snapshot = await getDocs(q);
    snapshot.forEach((doc) => response.push(doc.data()));
    set(response);
  } catch (error) {
    console.log(error.message);
  }
}

export async function getUserData(set, name) {
  try {
    const q = query(
      collection(db, "users"),
      where("username", "==", `${name}`)
    );
    const snapshot = await getDocs(q);
    snapshot.forEach((doc) => {
      set(doc.data());
    });
  } catch (error) {
    console.log(error.message);
  }
}

export async function getPostsForHome(set) {
  try {
    let reponse = [];
    const q = query(collection(db, "posts"), orderBy("created", "desc"));
    const snapshot = await getDocs(q);
    snapshot.forEach((doc) => reponse.push(doc.data()));
    set(reponse);
  } catch (error) {
    console.log(error.message);
  }
}

export async function getUsers(set) {
  try {
    let response = [];
    const q = query(collection(db, "users"));
    const snapshot = await getDocs(q);
    snapshot.forEach((doc) => {
      response.push(doc.data());
    });
    set(response);
  } catch (error) {
    console.log(error.message);
  }
}

export async function getComments(set, id) {
  try {
    let response = [];
    const q = query(collection(db, "comments"), orderBy("created", "asc"));
    const snapshot = await getDocs(q);
    snapshot.forEach((doc) => response.push(doc.data()));
    response = response.filter((r) => r.postId === id);
    set(response);
  } catch (error) {
    console.log(error);
  }
}

export async function deletePost(id) {
  try {
    await deleteDoc(doc(db, "posts", id));
    const q = query(collection(db, "comments"), where("postId", "==", id));
    const snapshot = await getDocs(q);
    snapshot.forEach((doc) => {
      deleteDoc(doc.ref);
    });
    const postPicRef = ref(storage, `postPic/${id}`);
    await deleteObject(postPicRef);
  } catch (error) {
    console.log(error.message);
  }
}

export async function addComment(postId, set, render, commentText, userData) {
  if (commentText === "") return;
  const id = uuidv4();
  try {
    await setDoc(doc(db, "comments", id), {
      commentId: id,
      postId: postId,
      text: commentText,
      username: userData.username,
      userPic: userData.profilePic,
      created: Date.now(),
    });
    set(!render);
  } catch (error) {
    console.log(error.message);
  }
}

export async function addPost(pic, userData, caption) {
  if (pic === null) return;
  try {
    const id = uuidv4();
    // upload pic to the databse
    const postPicRef = ref(storage, `postPic/${id}`);
    uploadBytes(postPicRef, pic)
      .then((spanshot) => {
        // get url of the pic for add it to the posts collection
        return getDownloadURL(spanshot.ref);
      })
      .then((downloadURL) => {
        setDoc(doc(db, "posts", id), {
          id: id,
          user: userData.username,
          userPic: userData.profilePic,
          caption: caption,
          urlPic: downloadURL,
          likes: [],
          created: Date.now(),
        });
      });
  } catch (error) {
    console.log(error.message);
  }
}

export async function addRemovefollow(profileName, username, set, render) {
  try {
    const q = query(collection(db, "users"), where("username", "==", username));
    const snapshot = await getDocs(q);
    snapshot.forEach(async (doc) => {
      if (doc.data().following.includes(profileName)) {
        await removeFollow(profileName, username);
      } else {
        // else add it to array
        await addFollow(profileName, username);
      }
    });
    setTimeout(() => {
      set(!render);
    }, 300);
  } catch (error) {
    console.log(error.message);
  }
}

async function addFollow(profileName, username) {
  try {
    await updateDoc(doc(db, `users`, username), {
      following: arrayUnion(profileName),
    });
    await updateDoc(doc(db, "users", profileName), {
      follower: arrayUnion(username),
    });
  } catch (error) {
    console.log(error);
  }
}

async function removeFollow(profileName, username) {
  try {
    await updateDoc(doc(db, `users`, username), {
      following: arrayRemove(profileName),
    });
    await updateDoc(doc(db, "users", profileName), {
      follower: arrayRemove(username),
    });
  } catch (error) {
    console.log(error);
  }
}

export async function addRemoveLike(id, userData, set, render) {
  try {
    const q = query(collection(db, "posts"), where("id", "==", id));
    const snapshot = await getDocs(q);
    snapshot.forEach(async (doc) => {
      if (doc.data().likes.includes(userData.username)) {
        await removeLike(id, userData);
      } else {
        // else add it to array
        await addLike(id, userData);
      }
    });
    setTimeout(() => {
      set(!render);
    }, 300);
  } catch (error) {
    console.log(error);
  }
}

async function addLike(id, userData) {
  try {
    await updateDoc(doc(db, `posts`, id), {
      likes: arrayUnion(userData.username),
    });
  } catch (error) {
    console.log(error);
  }
}

async function removeLike(id, userData) {
  try {
    await updateDoc(doc(db, `posts`, id), {
      likes: arrayRemove(userData.username),
    });
  } catch (error) {
    console.log(error);
  }
}

export async function changeProfilePic(
  file,
  userData,
  set,
  render,
  setUserData
) {
  try {
    const profilePicRef = ref(storage, `profilePic/${userData.username}`);
    await uploadBytes(profilePicRef, file)
      .then((snapshot) => {
        return getDownloadURL(snapshot.ref);
      })
      .then((downloadURL) => {
        updateDoc(doc(db, "users", userData.username), {
          profilePic: downloadURL,
        });
      });
    set(!render);
    getUserData(setUserData, userData.username);
  } catch (error) {
    console.log(error);
  }
}

export function uploadPic(e, setPic, setShowPic) {
  // setPic for add to database, setShowPic for show the pic
  setPic(e.target.files[0]);
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    setShowPic(reader.result);
  });
  reader.readAsDataURL(e.target.files[0]);
}

//handle search for mainbar
export function handleSearch(e, set, users) {
  if (e.target.value === "") {
    set([]);
  } else {
    const newSearch = users.filter((user) => {
      return user.username
        .toLowerCase()
        .trim()
        .includes(e.target.value.toLowerCase().trim());
    });
    set(newSearch);
  }
}

//clicking somewhere else when searching users remove search
export function blur(input, set) {
  input.current.value = "";
  setTimeout(() => {
    console.log("cia");
    set([]);
  }, 100);
}

export function getTime(time) {
  let timePassed = Date.now() - time;
  let seconds = timePassed / 1000;
  if (seconds < 60) {
    return "now";
  } else if (seconds < 3600) {
    if (seconds / 60 === 1) {
      return "1 minute ago";
    }
    return `${parseInt(seconds / 60)} minutes ago`;
  } else if (seconds < 86400) {
    if (seconds / 3600 === 1) {
      return "1 hour ago";
    }
    return `${parseInt(seconds / 3600)} hours ago`;
  } else if (seconds < 2419200) {
    if (seconds / 86400 === 1) {
      return "1 day ago";
    }
    return `${parseInt(seconds / 86400)} days ago`;
  } else {
    const date = new Date(time);
    return date.toString().slice(3, 15);
  }
}