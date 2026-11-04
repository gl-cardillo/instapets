import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthContext, type AuthState } from "../../auth/AuthContext";
import { toggleLike } from "../../services/posts";
import type { Post, UserProfile } from "../../types";
import { LikeableImage } from "./LikeableImage";

vi.mock("../../firebase/config", () => ({ auth: {}, db: {} }));
vi.mock("../../services/collections", () => ({}));
vi.mock("../../services/posts", () => ({ toggleLike: vi.fn() }));
vi.mock("../../services/images", () => ({
  getPostImage: async () => "data:image/webp;base64,AAAA",
}));
const navigate = vi.fn();
vi.mock("react-router", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router")>()),
  useNavigate: () => navigate,
}));

const alice = { username: "alice" } as UserProfile;
const post = (likes: string[]) =>
  ({ id: "p1", user: "bob", caption: "", urlPic: "", likes }) as Post;

function renderImage(p: Post, profile: UserProfile | null = alice) {
  const onPostChange = vi.fn();
  const value = {
    authUser: null,
    profile,
    loading: false,
    emailVerified: true,
    refreshProfile: vi.fn(),
    refreshEmailVerified: vi.fn(),
  } as AuthState;
  render(
    <MemoryRouter>
      <AuthContext.Provider value={value}>
        <LikeableImage post={p} onPostChange={onPostChange} />
      </AuthContext.Provider>
    </MemoryRouter>,
  );
  return onPostChange;
}

const doubleTap = () => fireEvent.doubleClick(screen.getByRole("img"));

describe("LikeableImage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("likes on double-tap and shows a heart", async () => {
    const liked = post(["alice"]);
    vi.mocked(toggleLike).mockResolvedValue(liked);
    const onPostChange = renderImage(post([]));
    doubleTap();
    expect(screen.getByTestId("like-burst")).toBeInTheDocument();
    expect(toggleLike).toHaveBeenCalledWith(post([]), "alice");
    await waitFor(() => expect(onPostChange).toHaveBeenCalledWith(liked));
  });

  it("never unlikes, but still shows the heart", () => {
    renderImage(post(["alice"]));
    doubleTap();
    expect(screen.getByTestId("like-burst")).toBeInTheDocument();
    expect(toggleLike).not.toHaveBeenCalled();
  });

  it("hides the heart once its animation is over", () => {
    vi.useFakeTimers();
    try {
      renderImage(post(["alice"]));
      doubleTap();
      act(() => vi.advanceTimersByTime(800));
      expect(screen.getByTestId("like-burst")).toBeInTheDocument();
      act(() => vi.advanceTimersByTime(100));
      expect(screen.queryByTestId("like-burst")).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it("sends guests to log in, without a heart", () => {
    renderImage(post([]), null);
    doubleTap();
    expect(navigate).toHaveBeenCalledWith("/login");
    expect(screen.queryByTestId("like-burst")).not.toBeInTheDocument();
    expect(toggleLike).not.toHaveBeenCalled();
  });
});
