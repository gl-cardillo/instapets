// Shapes of the Firestore documents

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
  // a small data URL, "" for the default picture, or (older users) a
  // Firebase Storage URL that no longer loads
  profilePic: string;
}

// posts/{id}
export interface Post {
  id: string;
  // author's username
  user: string;
  // older posts: the author's picture when posted; "" on newer ones
  userPic: string;
  caption: string;
  // older posts: a Firebase Storage URL that no longer loads; "" on newer
  // ones, whose picture is in images/{id}
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

// images/{postId}: a post's picture, kept out of the post doc so that
// loading posts stays cheap
export interface PostImage {
  // the post author's username
  owner: string;
  // data URL
  src: string;
}
