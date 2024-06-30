import "./Home.css";
import { useState, useEffect, useContext } from "react";
import { UserDataContext } from "../../dataContext/dataContext";
import { Link } from "react-router-dom";
import { BsX } from "react-icons/bs";
import { getPostsForHome, addRemoveLike, deletePost } from "../../utils/utils";
import { LikeAndComment } from "../LikesAndComments/LikesAndComments";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import Swal from "sweetalert2";
import { swalStyle, handleSuccess } from "../../utils/utils";

export function Home() {
  const [posts, setPosts] = useState(null);
  const [render, setRender] = useState(false);
  const { userData, users } = useContext(UserDataContext);

  useEffect(() => {
    getPostsForHome(setPosts);
  }, [render]);

  const confirmDeletePost = (postId) => {
    Swal.fire({
      title: "Are you sure you want to delete this user?",
      position: "top",
      showCancelButton: true,
      confirmButtonText: "Close",
      cancelButtonText: "Delete",
      ...swalStyle,
    }).then((result) => {
      if (result.isDismissed) {
        deletePost(postId);
        getPostsForHome(setPosts);

        Swal.close();
        handleSuccess("post deleted");
      } else {
        Swal.close();
      }
    });
  };

  return (
    <div className="main-page">
      <div className="home-section">
        {posts ? (
          posts.map((post, index) => {
            return (
              <div key={index} className="home-post">
                <div className="name-delete">
                  <Link to={`/profile/${post.user}`}>
                    <div className="name-profile-pic">
                      <img
                        src={
                          users
                            ? users.filter(
                                (user) => user.username === post.user
                              )[0].profilePic
                            : ""
                        }
                        className="avatar"
                        alt="post"
                      />
                      <p>{post.user}</p>
                    </div>{" "}
                  </Link>
                  {post.user === userData.username ? (
                    <BsX
                      className="delete-button"
                      onClick={() => {
                        confirmDeletePost(post.id);
                      }}
                    />
                  ) : (
                    ""
                  )}
                </div>
                <img
                  src={post.urlPic}
                  alt="post"
                  className="home-post-pic"
                  onDoubleClick={() =>
                    addRemoveLike(post.id, userData, setRender, render)
                  }
                />
                <LikeAndComment
                  post={post}
                  render={render}
                  setRender={setRender}
                />
              </div>
            );
          })
        ) : (
          <Skeleton width={600} height={500} count={5} />
        )}
      </div>
    </div>
  );
}
