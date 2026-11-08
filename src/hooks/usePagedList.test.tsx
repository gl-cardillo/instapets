import { act, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Post } from "../types";
import type { FeedPage } from "../utils/feed";
import { usePagedList } from "./usePagedList";

vi.mock("../utils/alerts", () => ({ reportError: vi.fn() }));

// jsdom has no IntersectionObserver; this one is triggered by hand
let observers: { callback: IntersectionObserverCallback; observing: boolean }[];
class FakeObserver {
  entry: (typeof observers)[number];
  constructor(callback: IntersectionObserverCallback) {
    this.entry = { callback, observing: false };
    observers.push(this.entry);
  }
  observe() {
    this.entry.observing = true;
  }
  disconnect() {
    this.entry.observing = false;
  }
}
// waits for the hook to start watching, or the scroll would be missed
const scrollToEnd = async () => {
  await waitFor(() => expect(observers.some((o) => o.observing)).toBe(true));
  await act(async () => {
    for (const o of observers.filter((o) => o.observing)) {
      await o.callback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    }
  });
};

const post = (id: string, created: number) => ({ id, created }) as Post;

function List({
  loadPage,
}: {
  loadPage: (after: number | null) => Promise<FeedPage>;
}) {
  const { page, endRef } = usePagedList(loadPage);
  return (
    <>
      {page?.posts.map((p) => (
        <p key={p.id}>{p.id}</p>
      ))}
      <div ref={endRef} />
    </>
  );
}

describe("usePagedList", () => {
  beforeEach(() => {
    observers = [];
    vi.stubGlobal("IntersectionObserver", FakeObserver);
  });
  afterEach(() => vi.unstubAllGlobals());

  it("loads the next page at the end, and stops when there are no more", async () => {
    const loadPage = vi.fn(async (after: number | null) =>
      after === null
        ? { posts: [post("a", 3), post("b", 2)], next: 2 }
        : { posts: [post("c", 1)], next: null },
    );
    render(<List loadPage={loadPage} />);
    expect(await screen.findByText("b")).toBeInTheDocument();

    await scrollToEnd();
    expect(await screen.findByText("c")).toBeInTheDocument();
    expect(loadPage).toHaveBeenLastCalledWith(2);

    // nothing left, so it stops watching for the end
    await waitFor(() => expect(observers.some((o) => o.observing)).toBe(false));
    expect(loadPage).toHaveBeenCalledTimes(2);
  });
});
