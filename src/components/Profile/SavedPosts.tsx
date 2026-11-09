import { useCallback } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { usePagedList } from "../../hooks/usePagedList";
import { useSavedIds } from "../../hooks/useSaved";
import { getPost } from "../../services/posts";
import { Notice } from "../ui/Notice";
import { PostGrid } from "./PostGrid";

const PAGE_SIZE = 12;

// your saved posts, newest saved first
export function SavedPosts() {
  const ids = useSavedIds();
  // depend on the ids, not a new array each render
  const key = [...ids].reverse().join("\n");

  // the cursor is a position in the list here, not a date
  const loadPage = useCallback(
    async (after: number | null) => {
      const all = key ? key.split("\n") : [];
      const start = after ?? 0;
      const end = start + PAGE_SIZE;
      const posts = await Promise.all(all.slice(start, end).map(getPost));
      return {
        // saved posts can since have been deleted
        posts: posts.filter((post) => post !== null),
        next: end < all.length ? end : null,
      };
    },
    [key],
  );
  const { page, endRef, loadingMore } = usePagedList(loadPage);

  return (
    <>
      {!page && <Skeleton height={120} />}
      {page?.posts.length === 0 && (
        <Notice title="No saved posts yet">
          Tap the bookmark on any post to keep it here. Only you can see them.
        </Notice>
      )}
      {!!page?.posts.length && <PostGrid posts={page.posts} />}
      {loadingMore && <Skeleton height={120} />}
      <div ref={endRef} />
    </>
  );
}
