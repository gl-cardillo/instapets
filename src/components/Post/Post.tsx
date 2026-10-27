import "./Post.css";
import { useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BsX } from "react-icons/bs";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useAuth, useProfilePic } from "../../auth/AuthContext";
import { useLoader } from "../../hooks/useLoader";
import { deletePost, getPost } from "../../services/posts";
import { confirmDelete, handleSuccess, reportError } from "../../utils/alerts";
import { Avatar } from "../Avatar/Avatar";
import { LikeAndComment } from "../LikesAndComments/LikesAndComments";
import { PostImage } from "../PostImage/PostImage";

export function Post() {
  const { profile } = useAuth();
  const profilePicOf = useProfilePic();
  const navigate = useNavigate();
  const { postId = "" } = useParams();
  // undefined while loading, null if it doesn't exist
  const { data: post, setData: setPost } = useLoader(
    useCallback(() => getPost(postId), [postId]),
  );

  const confirmDeletePost = async () => {
    if (!post) return;
    if (!(await confirmDelete("Are you sure you want to delete this post?")))
      return;
    try {
      await deletePost(post.id);
      navigate(-1);
      handleSuccess("post deleted");
    } catch (error) {
      reportError(error);
    }
  };

  if (post === null) {
    return (
      <div className="main-page">
        <p>This post doesn't exist anymore.</p>
      </div>
    );
  }

  if (post === undefined) {
    return (
      <div className="main-page">
        <div>
          <Skeleton height={400} style={{ margin: "10px 0" }} />
          <p>
            <Skeleton count={3} />
          </p>
        </div>
      </div>
    );
  }

  // shown above the picture on small screens and beside it on large ones
  const header = (
    <>
      <div className="avatar-pic">
        <Avatar src={profilePicOf(post.user, post.userPic)} alt="user avatar" />
        <h3>{post.user}</h3>
      </div>
      {post.user === profile?.username && (
        <BsX className="delete-button" onClick={confirmDeletePost} />
      )}
    </>
  );

  return (
    <div className="main-page">
      <div className="single-post">
        <div className="user-section-425px">{header}</div>
        <div className="left-section">
          <PostImage post={post} />
        </div>
        <div className="right-section">
          <div className="user-section-1024px">{header}</div>
          <LikeAndComment post={post} onPostChange={setPost} />
        </div>
      </div>
    </div>
  );
}
