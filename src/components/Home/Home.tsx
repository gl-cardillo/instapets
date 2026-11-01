import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useLoader } from "../../hooks/useLoader";
import { deletePost, getFeed } from "../../services/posts";
import type { Post } from "../../types";
import { confirmDelete, handleSuccess, reportError } from "../../utils/alerts";
import { PostCard } from "./PostCard";

export function Home() {
  const { data: feed, setData: setFeed } = useLoader(
    useCallback(() => getFeed(), []),
  );
  const [loadingMore, setLoadingMore] = useState(false);
  // more posts load when this scrolls into view
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
    <div className="mx-auto box-border flex w-full max-w-xl flex-col gap-4 p-4">
      {!feed && <Skeleton height={420} count={2} className="mb-4" />}
      {feed?.posts.length === 0 && (
        <div className="rounded-card border border-line bg-surface p-8 text-center">
          <p className="font-bold">No pets here yet</p>
          <p className="mt-1 text-sm text-muted">
            Be the first to{" "}
            <Link to="/uploadPost" className="font-bold text-primary">
              share a picture
            </Link>
          </p>
        </div>
      )}
      {feed?.posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onPostChange={updatePost}
          onDelete={confirmDeletePost}
        />
      ))}
      <div ref={endRef} />
      {loadingMore && <Skeleton height={420} />}
    </div>
  );
}
