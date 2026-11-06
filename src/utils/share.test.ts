import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Post } from "../types";
import { postUrl, sharePost } from "./share";

const post = { id: "p1", user: "Amleto" } as Post;
const url = "http://localhost:3000/instapets/#/post/p1";

describe("sharePost", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", "/instapets/#/home");
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn(async () => {}) },
    });
  });

  afterEach(() => {
    Object.assign(navigator, { share: undefined });
  });

  it("links to the post page, whatever page you're on", () => {
    expect(postUrl("p1")).toBe(url);
  });

  it("uses the device share sheet when there is one", async () => {
    const share = vi.fn(async () => {});
    Object.assign(navigator, { share });
    expect(await sharePost(post)).toBe("shared");
    expect(share).toHaveBeenCalledWith({ title: "Amleto on Instapets", url });
    expect(navigator.clipboard.writeText).not.toHaveBeenCalled();
  });

  it("does nothing when the share sheet is closed", async () => {
    Object.assign(navigator, {
      share: vi.fn(async () => {
        throw new DOMException("cancelled", "AbortError");
      }),
    });
    expect(await sharePost(post)).toBe("cancelled");
    expect(navigator.clipboard.writeText).not.toHaveBeenCalled();
  });

  it("copies the link without a share sheet, or if it fails", async () => {
    expect(await sharePost(post)).toBe("copied");
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(url);

    Object.assign(navigator, {
      share: vi.fn(async () => {
        throw new DOMException("not allowed", "NotAllowedError");
      }),
    });
    expect(await sharePost(post)).toBe("copied");
  });
});
