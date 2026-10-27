import "./Home.css";
import { Link } from "react-router-dom";
import { BsX } from "react-icons/bs";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useAuth, useProfilePic } from "../../auth/AuthContext";
import { useLikeToggle } from "../../hooks/useLikeToggle";
import { useLoader } from "../../hooks/useLoader";
import { deletePost, getFeed } from "../../services/posts";
import type { Post } from "../../types";
import { confirmDelete, handleSuccess, reportError } from "../../utils/alerts";
import { Avatar } from "../Avatar/Avatar";
import { LikeAndComment } from "../LikesAndComments/LikesAndComments";
import { PostImage } from "../PostImage/PostImage";

export function Home() {
  const { data: posts, setData: setPosts } = useLoader(getFeed);
  const { profile } = useAuth();
  const profilePicOf = useProfilePic();

  const updatePost = (updated: Post) =>
    setPosts((current) =>
      current?.map((post) => (post.id === updated.id ? updated : post)),
    );
  const toggleLike = useLikeToggle(updatePost);

  const confirmDeletePost = async (postId: string) => {
    if (!(await confirmDelete("Are you sure you want to delete this post?")))
      return;
    try {
      await deletePost(postId);
      setPosts((current) => current?.filter((post) => post.id !== postId));
      handleSuccess("post deleted");
    } catch (error) {
      reportError(error);
    }
  };

  return (
    <div className="main-page">
      <div className="home-section">
        {posts ? (
          posts.map((post) => (
            <div key={post.id} className="home-post">
              <div className="name-delete">
                <Link to={`/profile/${post.user}`}>
                  <div className="name-profile-pic">
                    <Avatar src={profilePicOf(post.user, post.userPic)} />
                    <p>{post.user}</p>
                  </div>{" "}
                </Link>
                {post.user === profile?.username && (
                  <BsX
                    className="delete-button"
                    onClick={() => confirmDeletePost(post.id)}
                  />
                )}
              </div>
              <PostImage
                post={post}
                className="home-post-pic"
                onDoubleClick={() => toggleLike(post)}
              />
              <LikeAndComment post={post} onPostChange={updatePost} />
            </div>
          ))
        ) : (
          <Skeleton width={600} height={500} count={5} />
        )}
      </div>
    </div>
  );
}
