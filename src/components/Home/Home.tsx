import "./Home.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { BsX } from "react-icons/bs";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useAuth } from "../../auth/AuthContext";
import { useLikeToggle } from "../../hooks/useLikeToggle";
import { useLoader } from "../../hooks/useLoader";
import { deletePost, getFeed } from "../../services/posts";
import type { Post } from "../../types";
import { confirmDelete, handleSuccess, reportError } from "../../utils/alerts";
import { UserAvatar } from "../Avatar/Avatar";
import { LikeAndComment } from "../LikesAndComments/LikesAndComments";
import { PostImage } from "../PostImage/PostImage";

export function Home() {
  const { data: feed, setData: setFeed } = useLoader(
    useCallback(() => getFeed(), []),
  );
  const { profile } = useAuth();
  const [loadingMore, setLoadingMore] = useState(false);
  // more posts are loaded when this scrolls into view
  const endRef = useRef<HTMLDivElement>(null);

  const updatePost = (updated: Post) =>
    setFeed(
      (current) =>
        current && {
          ...current,
          posts: current.posts.map((post) =>
            post.id === updated.id ? updated : post,
          ),
        },
    );
  const toggleLike = useLikeToggle(updatePost);

  const next = feed?.next ?? null;
  useEffect(() => {
    if (next === null || loadingMore || !endRef.current) return;
    const observer = new IntersectionObserver(async ([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      setLoadingMore(true);
      try {
        const page = await getFeed(next);
        setFeed(
          (current) =>
            current && {
              posts: [...current.posts, ...page.posts],
              next: page.next,
            },
        );
      } catch (error) {
        reportError(error);
      } finally {
        setLoadingMore(false);
      }
    });
    observer.observe(endRef.current);
    return () => observer.disconnect();
  }, [next, loadingMore, setFeed]);

  const confirmDeletePost = async (postId: string) => {
    if (!(await confirmDelete("Are you sure you want to delete this post?")))
      return;
    try {
      await deletePost(postId);
      setFeed(
        (current) =>
          current && {
            ...current,
            posts: current.posts.filter((post) => post.id !== postId),
          },
      );
      handleSuccess("post deleted");
    } catch (error) {
      reportError(error);
    }
  };

  return (
    <div className="main-page">
      <div className="home-section">
        {feed ? (
          feed.posts.map((post) => (
            <div key={post.id} className="home-post">
              <div className="name-delete">
                <Link to={`/profile/${post.user}`}>
                  <div className="name-profile-pic">
                    <UserAvatar username={post.user} fallback={post.userPic} />
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
        <div ref={endRef} />
        {loadingMore && <Skeleton width={600} height={500} />}
      </div>
    </div>
  );
}
