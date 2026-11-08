import { useCallback, useEffect, useRef, useState } from "react";
import { reportError } from "../utils/alerts";
import type { FeedPage } from "../utils/feed";
import { useLoader } from "./useLoader";

// loads the first page, then the next whenever `endRef` scrolls into view
export function usePagedList(
  loadPage: (after: number | null) => Promise<FeedPage>,
) {
  const { data, setData } = useLoader(
    useCallback(() => loadPage(null), [loadPage]),
  );
  const [loadingMore, setLoadingMore] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const next = data?.next ?? null;
  useEffect(() => {
    if (next === null || loadingMore || !endRef.current) return;
    const observer = new IntersectionObserver(async ([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      setLoadingMore(true);
      try {
        const page = await loadPage(next);
        setData(
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
  }, [next, loadingMore, loadPage, setData]);

  return { page: data, setPage: setData, endRef, loadingMore };
}
