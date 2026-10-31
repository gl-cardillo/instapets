import "./LikesAndComments.css";
import { useCallback, useState } from "react";
import { Link } from "react-router";
import { BsSuitHeart, BsSuitHeartFill, BsChat, BsX } from "react-icons/bs";
import { useAuth, useCanWrite } from "../../auth/AuthContext";
import { useLikeToggle } from "../../hooks/useLikeToggle";
import { useLoader } from "../../hooks/useLoader";
import {
  addComment,
  deleteComment,
  getComments,
} from "../../services/comments";
import { MAX_COMMENT_LENGTH } from "../../limits";
import type { Post } from "../../types";
import { reportError } from "../../utils/alerts";
import { getTime } from "../../utils/time";
import { Avatar, UserAvatar } from "../Avatar/Avatar";
import { UserCards } from "../Card/UserCards";
import { Button } from "../ui/Button";

interface Props {
  post: Post;
  onPostChange: (post: Post) => void;
}

export function LikeAndComment({ post, onPostChange }: Props) {
  const { profile } = useAuth();
  const canWrite = useCanWrite();
  const toggleLike = useLikeToggle(onPostChange);
  const { data: comments = [], reload: loadComments } = useLoader(
    useCallback(() => getComments(post.id), [post.id]),
  );
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [showAddComments, setShowAddComments] = useState(false);
  const [showLikes, setShowLikes] = useState(false);

  const toggleAddComments = () => {
    if (canWrite()) setShowAddComments(!showAddComments);
  };

  const submitComment = async () => {
    if (commentText.trim() === "") return;
    const me = canWrite();
    if (!me) return;
    try {
      await addComment(post.id, commentText, me);
      setCommentText("");
      setShowComments(true);
      await loadComments();
    } catch (error) {
      reportError(error);
    }
  };

  const removeComment = async (commentId: string) => {
    if (!profile) return;
    try {
      await deleteComment(commentId, profile.username);
      await loadComments();
    } catch (error) {
      reportError(error);
    }
  };

  const liked = profile !== null && post.likes.includes(profile.username);

  return (
    <div className="l-c-section">
      <div>
        <div className="heart-chat">
          {liked ? (
            <BsSuitHeartFill
              className="l-c-button"
              onClick={() => toggleLike(post)}
              style={{ color: "var(--color-like)" }}
            />
          ) : (
            <BsSuitHeart
              className="l-c-button"
              onClick={() => toggleLike(post)}
            />
          )}
          <BsChat className="l-c-button" onClick={toggleAddComments} />
        </div>
        <div className="likes-comments">
          {post.likes.length > 0 && (
            <div className="who-likes">
              <p>Post liked by&nbsp; </p>
              <Link className="user-who-liked" to={`/profile/${post.likes[0]}`}>
                {post.likes[0]}
              </Link>
              {post.likes.length > 1 && (
                <p>
                  &nbsp;and&nbsp;
                  <span
                    onClick={() => setShowLikes(true)}
                    className="user-who-liked"
                  >
                    {post.likes.length - 1}
                  </span>{" "}
                  other{post.likes.length > 2 ? "s" : ""}
                </p>
              )}
            </div>
          )}
          {showLikes && (
            <div className="black-screen">
              <div className="screen-container">
                <div className="close-container">
                  <BsX
                    className="delete-button"
                    onClick={() => setShowLikes(false)}
                  />
                </div>
                <UserCards usernames={post.likes} />
              </div>
            </div>
          )}
          <p>{post.caption}</p>
          <p className="time-posted">{getTime(post.created)}</p>
          {comments.length > 0 && (
            <p
              className="show-comments-button"
              onClick={() => setShowComments(!showComments)}
            >
              {showComments ? "Hide comments" : "Show comments"}
            </p>
          )}
        </div>
        <div className="comments-section">
          {showComments &&
            comments.map((comment) => (
              <div key={comment.commentId} className="comments-posted">
                <div className="comments-posted-pic-name">
                  <Link to={`/profile/${comment.username}`}>
                    <UserAvatar
                      username={comment.username}
                      fallback={comment.userPic}
                    />
                  </Link>
                  <div className="comments-details">
                    <Link to={`/profile/${comment.username}`}>
                      <p className="username-comment">{comment.username}</p>
                    </Link>
                    <p className="comment-text">{comment.text}</p>
                  </div>
                </div>
                <div style={{ display: "flex" }}>
                  <p style={{ marginLeft: "auto" }} className="time-posted">
                    {getTime(comment.created)}
                  </p>
                  <div style={{ width: "20px" }}>
                    {comment.username === profile?.username && (
                      <BsX
                        className="delete-button"
                        onClick={() => removeComment(comment.commentId)}
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
      {showAddComments && profile && (
        <div className="add-comment">
          <Avatar src={profile.profilePic} />
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write a comment..."
            maxLength={MAX_COMMENT_LENGTH}
            className="textarea-comment"
          />
          <Button size="sm" onClick={submitComment}>
            Add
          </Button>
        </div>
      )}
    </div>
  );
}
