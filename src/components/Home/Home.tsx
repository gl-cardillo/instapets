import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Link, useSearchParams } from "react-router";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useAuth } from "../../auth/AuthContext";
import { useLoader } from "../../hooks/useLoader";
import { deletePost, getFeed, getFollowingFeed } from "../../services/posts";
import type { Post } from "../../types";
import { confirmDelete, handleSuccess, reportError } from "../../utils/alerts";
import type { FeedPage } from "../../utils/feed";
import { Notice } from "../ui/Notice";
import { PostCard } from "./PostCard";

type Mode = "everyone" | "following";

function Tab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`flex-1 cursor-pointer rounded-pill px-4 py-1.5 text-sm font-bold transition-colors ${
        active ? "bg-primary text-on-primary" : "text-muted hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

export function Home() {
  const { profile } = useAuth();
  const [params, setParams] = useSearchParams();
  // guests only get everyone's posts
  const mode: Mode =
    profile && params.get("feed") === "following" ? "following" : "everyone";
  const following = profile?.following ?? [];
  // depend on the names, not a new array each render
  const followingKey = following.join("\n");

  const loadPage = useCallback(
    (after: number | null) =>
      mode === "following"
        ? getFollowingFeed(followingKey ? followingKey.split("\n") : [], after)
        : getFeed(after),
    [mode, followingKey],
  );

  const show = (next: Mode) =>
    setParams(next === "following" ? { feed: "following" } : {}, {
      replace: true,
    });

  const empty =
    mode === "everyone" ? (
      <Notice title="No pets here yet">
        Be the first to{" "}
        <Link to="/uploadPost" className="font-bold text-primary">
          share a picture
        </Link>
      </Notice>
    ) : following.length === 0 ? (
      <Notice title="You're not following anyone yet">
        <Link to="/searchPage" className="font-bold text-primary">
          Find pets to follow
        </Link>
      </Notice>
    ) : (
      <Notice title="No posts from pets you follow yet" />
    );

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4 p-4">
      <h2 className="sr-only">Feed</h2>
      {profile && (
        <div
          role="tablist"
          aria-label="Feed"
          className="flex rounded-pill border border-line bg-surface p-1"
        >
          <Tab active={mode === "everyone"} onClick={() => show("everyone")}>
            Everyone
          </Tab>
          <Tab active={mode === "following"} onClick={() => show("following")}>
            Following
          </Tab>
        </div>
      )}
      {/* remount per tab so the two feeds never mix */}
      <Feed key={mode} loadPage={loadPage} empty={empty} />
    </div>
  );
}

interface FeedProps {
  loadPage: (after: number | null) => Promise<FeedPage>;
  empty: ReactNode;
}

function Feed({ loadPage, empty }: FeedProps) {
  const { data: feed, setData: setFeed } = useLoader(
    useCallback(() => loadPage(null), [loadPage]),
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
        const page = await loadPage(next);
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
  }, [next, loadingMore, loadPage, setFeed]);

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
    <>
      {!feed && <Skeleton height={420} count={2} className="mb-4" />}
      {feed?.posts.length === 0 && empty}
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
    </>
  );
}
