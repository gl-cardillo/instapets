import "./LikesAndComments.css";
import { BsSuitHeart, BsSuitHeartFill, BsChat, BsX } from "react-icons/bs";
import { UserDataContext } from "../../dataContext/dataContext";
import { useContext, useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Card } from "../Card/Card";
import {
  getTime,
  getComments,
  addRemoveLike,
  addComment,
  deleteComment,
} from "../../utils/utils";

export function LikeAndComment({ post, render, setRender }) {
  const { userData, users } = useContext(UserDataContext);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [showAddComments, setShowAddComments] = useState(false);
  const [showLikes, setShowLikes] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    getComments(setComments, post.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [render]);

  return (
    <div className="l-c-section">
      <div>
        <div className="heart-chat">
          {post.likes.includes(userData.username) ? (
            <BsSuitHeartFill
              className="l-c-button"
              onClick={() =>
                addRemoveLike(post.id, userData, setRender, render)
              }
              style={{ color: "red" }}
            />
          ) : (
            <BsSuitHeart
              className="l-c-button"
              onClick={() =>
                addRemoveLike(post.id, userData, setRender, render)
              }
            />
          )}
          <BsChat
            className="l-c-button"
            onClick={() => setShowAddComments(!showAddComments)}
          />
        </div>
        <div className="likes-comments">
          {post.likes.length > 1 ? (
            <p>{post.likes.length} likes</p>
          ) : (
            <p>{post.likes.length} like</p>
          )}
          {post.likes.length > 0 ? (
            <div className="who-likes">
              <p>post liked by&nbsp; </p>
              <Link className="user-who-liked" to={`/profile/${post.likes[0]}`}>
                {post.likes[0]}
              </Link>
              {post.likes.length > 1 ? (
                <p>
                  &nbsp; and other{" "}
                  <span
                    onClick={() => setShowLikes(true)}
                    className="user-who-liked"
                  >
                    {post.likes.length - 1}
                  </span>
                </p>
              ) : (
                ""
              )}
            </div>
          ) : (
            ""
          )}
          {showLikes ? (
            <div className="black-screen">
              <div className="screen-container">
                {" "}
                <BsX
                  className="delete-button"
                  onClick={() => {
                    setShowLikes(false);
                  }}
                />
                {users
                  .filter((user) => post.likes.includes(user.username))
                  .map((user, index) => {
                    return <Card user={user} key={index} />;
                  })}
              </div>
            </div>
          ) : (
            ""
          )}
          <p>{post.caption}</p>
          <p className="time-posted">{getTime(post.created)}</p>
          {comments.length > 0 ? (
            <p
              className="show-comments-button"
              onClick={() => setShowComments(!showComments)}
            >
              {showComments ? "Hide comments" : "Show comments"}
            </p>
          ) : (
            ""
          )}
        </div>
        <div className="comments-section">
          {showComments
            ? comments.map((comment, index) => (
                <div key={index} className="comments-posted">
                  <div className="comments-posted-pic-name">
                    <Link to={`/profile/${comment.username}`}>
                      <img
                        src={
                          users
                            ? users.filter(
                                (user) => user.username === comment.username
                              )[0].profilePic
                            : ""
                        }
                        alt="avatar"
                        className="avatar"
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
                      {comment.username === userData.username ? (
                        <BsX
                          className="delete-button"
                          onClick={() => {
                            deleteComment(comment.commentId, userData.username);
                            setShowComments(true);
                            setRender(!render);
                          }}
                        />
                      ) : (
                        ""
                      )}
                    </div>
                  </div>
                </div>
              ))
            : ""}
        </div>
      </div>
      {showAddComments ? (
        <div className="add-comment">
          <img src={userData.profilePic} alt="avatar" className="avatar" />
          <textarea
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write a comment..."
            className="textarea-comment"
            ref={inputRef}
          />
          <button
            className="button"
            onClick={() => {
              setShowComments(true);
              inputRef.current.value = "";
              addComment(post.id, setRender, render, commentText, userData);
            }}
          >
            Add
          </button>
        </div>
      ) : (
        ""
      )}
    </div>
  );
}
