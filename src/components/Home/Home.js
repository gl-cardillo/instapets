import "./Home.css";
import { useState, useEffect, useContext } from "react";
import { UserDataContext } from "../../dataContext/dataContext";
import { Link } from "react-router-dom";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "../../firebase/config";
import { BsX } from "react-icons/bs";
import { getPostsForHome, addRemoveLike } from "../../utils/utils";
import { LikeAndComment } from "../LikesAndComments/LikesAndComments";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export function Home() {
  const [posts, setPosts] = useState(null);
  const [render, setRender] = useState(false);
  const { userData } = useContext(UserDataContext);

  async function deletePost(id) {
    await deleteDoc(doc(db, "posts", id));
    setRender(!render);
  }

  useEffect(() => {
    getPostsForHome(setPosts);
  }, [render]);

  return (
    <div className="main-page">
      <div className="home-section">
        {posts ? (
          posts.map((post, index) => {
            return (
              <div key={index} className="home-post">
                <div className="name-delete">
                  {" "}
                  <Link to={`/profile/${post.user}`}>
                    <div className="name-profile-pic">
                      <img src={post.userPic} alt="post" />
                      <p>{post.user}</p>
                    </div>{" "}
                  </Link>
                  {post.user === userData.username ? (
                    <BsX
                      className="delete-button"
                      onClick={() => deletePost(post.id)}
                    />
                  ) : ( "" )}
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