import "./LikesAndComments.css";
import { BsSuitHeart, BsSuitHeartFill, BsChat, BsX } from "react-icons/bs";
import { UserDataContext } from "../../dataContext/dataContext";
import { useContext, useState, useEffect, useRef } from "react";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "../../firebase/config";
import { Link } from "react-router-dom";
import {
  getTime,
  getComments,
  addRemoveLike,
  addComment,
} from "../../utils/utils";

export function LikeAndComment({ post, render, setRender }) {
  const { userData } = useContext(UserDataContext);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [showAddComments, setShowAddComments] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    getComments(setComments, post.id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [render]);

  async function deleteComment(id) {
    await deleteDoc(doc(db, "comments", id));
    setShowComments(true)
    setRender(!render);
  }

  return (
    <div className="l-c-section">
      <div >
      <div className="heart-chat">
        {post.likes.includes(userData.username) ? (
          <BsSuitHeartFill
            className="l-c-button"
            onClick={() => addRemoveLike(post.id, userData, setRender, render)}
            style={{ color: "red" }}
          />
        ) : (
          <BsSuitHeart
            className="l-c-button"
            onClick={() => addRemoveLike(post.id, userData, setRender, render)}
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
          <p className="who-likes">
            post liked by{" "}
            {post.likes.length > 1 ? (
              post.likes.slice(0, 3).map((user, index) => (
                <Link
                  key={index}
                  className="user-who-liked"
                  to={`/profile/${user}`}
                >
                  {post.likes[index + 1] ? `${user}, ` : `${user}`}
                  {index === 3 ? "..." : ""}
                </Link>
              ))
            ) : (
              <Link className="user-who-liked" to={`/profile/${post.likes[0]}`}>
                {post.likes[0]}
              </Link>
            )}
          </p>
        ) : ( "" )}
        <p>{post.caption}</p>
        <p className="time-posted">{getTime(post.created)}</p>
        {comments.length > 0 ? (
          <p
            className="show-comments-button"
            onClick={() => setShowComments(!showComments)}
          >
            Show comments
          </p>
        ) : ( "" )}
        </div>
        <div className="comments-section">
          {showComments
            ? comments.map((comment, index) => (
                <div key={index} className="comments-posted">
                           <div style={{display:"flex"}}>
                  <Link to={`/profile/${comment.username}`}>
                    <img src={comment.userPic} alt="avatar" />
                  </Link>
                  <div className="comments-details">
                    <Link to={`/profile/${comment.username}`}>
                      <p className="username-comment">{comment.username}</p>
                    </Link>
                    <p className="comment-text">{comment.text}</p>
                  </div>
                  </div>
                  <div style={{display:"flex"}}>
                  <p style={{ marginLeft: "auto" }} className="time-posted">
                    {getTime(comment.created)}
                  </p>
                  <div style={{width: "20px"}}>
                  {comment.username === userData.username ? (
                    <BsX
                      className="delete-button" 
                      onClick={() => deleteComment(comment.commentId)}
                    />
                  ) : ( "" )}
                  </div>
                  </div>
                </div>
              ))
            : ""}
        </div>
        </div>
        {showAddComments ? (
          <div className="add-comment">
            <img src={userData.profilePic} alt="avatar user" />
            <textarea
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="textarea-comment"
              ref={inputRef}
            />
            <button
              className="comment-button"
              onClick={() => {
                setShowComments(true)
                inputRef.current.value = ""
                addComment(
                  post.id,
                  setRender,
                  render,
                  commentText,
                  userData
                )
              }
          }
              
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
