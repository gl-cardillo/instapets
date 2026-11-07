import { describe, expect, it } from "vitest";
import type { Post } from "../types";
import { chunks, mergeNewest } from "./feed";

const post = (id: string, created: number) => ({ id, created }) as Post;

describe("mergeNewest", () => {
  it("merges several queries newest first", () => {
    const page = mergeNewest(
      [
        [post("a", 9), post("c", 5)],
        [post("b", 7), post("d", 1)],
      ],
      3,
    );
    expect(page.posts.map((p) => p.id)).toEqual(["a", "b", "c"]);
    expect(page.next).toBe(5);
  });

  it("knows there's more when any query filled its page", () => {
    expect(mergeNewest([[post("a", 9), post("b", 8)], []], 2).next).toBe(8);
  });

  it("ends when no query has more", () => {
    expect(mergeNewest([[post("a", 9)], [post("b", 8)]], 3).next).toBeNull();
    expect(mergeNewest([], 3)).toEqual({ posts: [], next: null });
  });
});

describe("chunks", () => {
  it("splits into groups of 30 by default", () => {
    const groups = chunks(Array.from({ length: 65 }, (_, i) => i));
    expect(groups.map((g) => g.length)).toEqual([30, 30, 5]);
    expect(chunks([])).toEqual([]);
  });
});
