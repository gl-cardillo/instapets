import "./Post.css";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import { UserDataContext } from "../../dataContext/dataContext";
import { collection, getDocs, where, query } from "firebase/firestore";
import { BsX } from "react-icons/bs";
import { db } from "../../firebase/config";
import { deletePost } from "../../utils/utils";
import { LikeAndComment } from "../LikesAndComments/LikesAndComments";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import Swal from "sweetalert2";
import { swalStyle, handleSuccess } from "../../utils/utils";

export function Post() {
  const { userData, users } = useContext(UserDataContext);
  let navigate = useNavigate();
  let { postId } = useParams();
  const [post, setPost] = useState(null);
  const [render, setRender] = useState(false);

  useEffect(() => {
    async function getPost() {
      const q = query(collection(db, "posts"), where("id", "==", postId));
      const snapshot = await getDocs(q);
      snapshot.forEach((doc) => {
        setPost(doc.data());
      });
    }
    getPost();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [render]);

  const confirmDeletePost = () => {
    Swal.fire({
      title: "Are you sure you want to delete this user?",
      position: "top",
      showCancelButton: true,
      confirmButtonText: "Close",
      cancelButtonText: "Delete",
      ...swalStyle,
    }).then((result) => {
      if (result.isDismissed) {
        deletePost(post.id);
        navigate(-1);

        Swal.close();
        handleSuccess("post deleted");
      } else {
        Swal.close();
      }
    });
  };

  return (
    <div className="main-page">
      {post ? (
        <div className="single-post">
          <div className="user-section-425px">
            <div className="avatar-pic">
              <img
                src={
                  users.filter((user) => user.username === post.user)[0]
                    .profilePic
                }
                alt="user avatar"
                className="avatar"
              />
              <h3>{post.user}</h3>
            </div>
            {post.user === userData.username ? (
              <BsX className="delete-button" onClick={confirmDeletePost} />
            ) : (
              ""
            )}
          </div>
          <div className="left-section">
            <img src={post.urlPic} alt="post" />
          </div>
          <div className="right-section">
            <div className="user-section-1024px">
              <div className="avatar-pic">
                <img
                  src={
                    users.filter((user) => user.username === post.user)[0]
                      .profilePic
                  }
                  alt="user avatar"
                  className="avatar"
                />
                <h3>{post.user}</h3>
              </div>
              {post.user === userData.username ? (
                <BsX
                  className="delete-button"
                  onClick={() => {
                    deletePost(post.id);
                    navigate(-1);
                  }}
                />
              ) : (
                ""
              )}
            </div>
            <LikeAndComment post={post} render={render} setRender={setRender} />
          </div>
        </div>
      ) : (
        <div>
          <Skeleton height={400} style={{ margin: "10px 0" }} />
          <p>
            <Skeleton count={3} />
          </p>
        </div>
      )}
    </div>
  );
}
