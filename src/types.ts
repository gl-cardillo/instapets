// firestore document shapes

// users/{username}
export interface UserProfile {
  email: string;
  username: string;
  // for case-insensitive search
  usernameLower: string;
  follower: string[];
  following: string[];
  // ids of posts this user liked
  likes: string[];
  // ids of comments this user wrote
  comments: string[];
  // data URL, "" for the default, or a dead Storage URL
  profilePic: string;
  // missing on older users
  bio?: string;
}

// posts/{id}
export interface Post {
  id: string;
  // author's username
  user: string;
  // older posts: the author's picture when posted; "" on newer ones
  userPic: string;
  caption: string;
  // dead Storage URL on old posts; "" on new ones (picture in images/{id})
  urlPic: string;
  // usernames
  likes: string[];
  created: number;
}

// comments/{commentId}
export interface PostComment {
  commentId: string;
  postId: string;
  text: string;
  username: string;
  // older comments: the author's picture when posted; "" on newer ones
  userPic: string;
  created: number;
}

// images/{postId}: kept apart so loading posts stays cheap
export interface PostImage {
  // the post author's username
  owner: string;
  // data URL
  src: string;
}
