import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getPostImage } from "../../services/images";
import type { Post } from "../../types";
import loadingImage from "../../img/image-loading.svg";
import unavailableImage from "../../img/image-unavailable.svg";
import { PostImage } from "./PostImage";

vi.mock("../../services/images", () => ({ getPostImage: vi.fn() }));
vi.mock("../../utils/alerts", () => ({ reportError: vi.fn() }));

const post = (extra: Partial<Post> = {}) =>
  ({ id: "p1", urlPic: "", likes: [], ...extra }) as Post;
const pic = "data:image/webp;base64,AAAA";

describe("PostImage", () => {
  // braces matter: a function returned from beforeEach runs as a cleanup hook
  beforeEach(() => {
    vi.mocked(getPostImage).mockReset();
  });

  it("shows a placeholder, then the picture from Firestore", async () => {
    vi.mocked(getPostImage).mockResolvedValue(pic);
    render(<PostImage post={post()} />);
    expect(screen.getByRole("img")).toHaveAttribute("src", loadingImage);
    await waitFor(() =>
      expect(screen.getByRole("img")).toHaveAttribute("src", pic),
    );
    expect(getPostImage).toHaveBeenCalledWith("p1");
  });

  it("says the picture is unavailable when there is none", async () => {
    vi.mocked(getPostImage).mockResolvedValue(null);
    render(<PostImage post={post()} />);
    await waitFor(() =>
      expect(screen.getByRole("img")).toHaveAttribute("src", unavailableImage),
    );
  });

  it("says the picture is unavailable when loading fails", async () => {
    vi.mocked(getPostImage).mockRejectedValue(new Error("offline"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    render(<PostImage post={post()} />);
    await waitFor(() =>
      expect(screen.getByRole("img")).toHaveAttribute("src", unavailableImage),
    );
  });

  it("uses an older post's URL, and the placeholder when it fails", () => {
    const old = "https://firebasestorage.example/old.png";
    render(<PostImage post={post({ urlPic: old })} />);
    expect(screen.getByRole("img")).toHaveAttribute("src", old);
    fireEvent.error(screen.getByRole("img"));
    expect(screen.getByRole("img")).toHaveAttribute("src", unavailableImage);
    expect(getPostImage).not.toHaveBeenCalled();
  });

  it("likes on double click", () => {
    const onDoubleClick = vi.fn();
    vi.mocked(getPostImage).mockResolvedValue(pic);
    render(<PostImage post={post()} onDoubleClick={onDoubleClick} />);
    fireEvent.doubleClick(screen.getByRole("img"));
    expect(onDoubleClick).toHaveBeenCalledOnce();
  });
});
