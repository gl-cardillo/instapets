import type { Post } from "../types";

export interface FeedPage {
  posts: Post[];
  // next page cursor, null at the end
  next: number | null;
}

// merges newest-first pages from several queries into one page
export function mergeNewest(pages: Post[][], pageSize: number): FeedPage {
  const all = pages.flat().sort((a, b) => b.created - a.created);
  const posts = all.slice(0, pageSize);
  // a full page from any query means it may have more
  const more =
    all.length > pageSize || pages.some((p) => p.length === pageSize);
  return {
    posts,
    next: more && posts.length ? posts[posts.length - 1].created : null,
  };
}

// firestore's "in" filter takes at most 30 values
export function chunks<T>(items: T[], size = 30): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size)
    out.push(items.slice(i, i + size));
  return out;
}
