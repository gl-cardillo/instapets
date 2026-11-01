import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthContext, type AuthState } from "../../auth/AuthContext";
import { addComment, getComments } from "../../services/comments";
import { getFeed } from "../../services/posts";
import type { Post, PostComment, UserProfile } from "../../types";
import { Home } from "./Home";
import { PostCard } from "./PostCard";

vi.mock("../../firebase/config", () => ({ auth: {}, db: {} }));
vi.mock("../../services/collections", () => ({}));
vi.mock("../../services/posts", () => ({
  getFeed: vi.fn(),
  deletePost: vi.fn(),
  toggleLike: vi.fn(),
}));
vi.mock("../../services/comments", () => ({
  getComments: vi.fn(),
  addComment: vi.fn(),
  deleteComment: vi.fn(),
}));
vi.mock("../../services/images", () => ({
  getPostImage: async () => "data:image/webp;base64,AAAA",
}));
vi.mock("../../hooks/useUser", () => ({
  useUser: () => null,
  useUsers: () => [],
}));

const alice = { username: "alice", profilePic: "" } as UserProfile;
const post = (extra: Partial<Post> = {}) =>
  ({
    id: "p1",
    user: "alice",
    userPic: "",
    caption: "my cat",
    urlPic: "",
    likes: [],
    created: Date.now(),
    ...extra,
  }) as Post;

function withAuth(ui: React.ReactNode, profile: UserProfile | null = alice) {
  const value = {
    authUser: null,
    profile,
    loading: false,
    emailVerified: true,
    refreshProfile: vi.fn(),
    refreshEmailVerified: vi.fn(),
  } as AuthState;
  return render(
    <MemoryRouter>
      <AuthContext.Provider value={value}>{ui}</AuthContext.Provider>
    </MemoryRouter>,
  );
}

const card = (p: Post, profile?: UserProfile | null, onDelete = vi.fn()) =>
  withAuth(
    <PostCard post={p} onPostChange={vi.fn()} onDelete={onDelete} />,
    profile,
  );

describe("Home", () => {
  beforeEach(() => {
    vi.mocked(getComments).mockResolvedValue([]);
  });

  it("invites people to post when the feed is empty", async () => {
    vi.mocked(getFeed).mockResolvedValue({ posts: [], next: null });
    withAuth(<Home />);
    expect(await screen.findByText("No pets here yet")).toBeInTheDocument();
    expect(screen.getByText("share a picture")).toHaveAttribute(
      "href",
      "/uploadPost",
    );
  });

  it("lists the posts", async () => {
    vi.mocked(getFeed).mockResolvedValue({ posts: [post()], next: null });
    withAuth(<Home />);
    expect(await screen.findByText("my cat")).toBeInTheDocument();
  });
});

describe("PostCard", () => {
  beforeEach(() => {
    vi.mocked(getComments).mockResolvedValue([]);
    vi.mocked(addComment).mockReset();
  });

  it("only lets the author delete", async () => {
    const onDelete = vi.fn();
    card(post(), alice, onDelete);
    fireEvent.click(await screen.findByRole("button", { name: "Delete post" }));
    expect(onDelete).toHaveBeenCalledWith("p1");
  });

  it("hides delete from other users", async () => {
    card(post({ user: "bob" }));
    await screen.findByText("my cat");
    expect(
      screen.queryByRole("button", { name: "Delete post" }),
    ).not.toBeInTheDocument();
  });

  it("shows whether you liked the post", async () => {
    card(post({ likes: ["alice"] }));
    expect(
      await screen.findByRole("button", { name: "Unlike" }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("opens and closes the list of likes", async () => {
    card(post({ likes: ["bob", "carol", "dave"] }));
    expect(await screen.findByText("bob")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "2 others" }));
    expect(
      screen.getByRole("dialog", { name: "Liked by" }),
    ).toBeInTheDocument();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("counts comments and reveals them", async () => {
    vi.mocked(getComments).mockResolvedValue([
      { commentId: "c1", username: "bob", text: "cute", created: 1 },
    ] as PostComment[]);
    card(post());
    fireEvent.click(
      await screen.findByRole("button", { name: "View 1 comment" }),
    );
    expect(screen.getByText("cute")).toBeInTheDocument();
  });

  it("sends a comment with Enter but not Shift+Enter", async () => {
    vi.mocked(addComment).mockResolvedValue();
    card(post());
    fireEvent.click(await screen.findByRole("button", { name: "Comment" }));
    const box = screen.getByRole("textbox", { name: "Write a comment" });
    fireEvent.change(box, { target: { value: "nice" } });

    fireEvent.keyDown(box, { key: "Enter", shiftKey: true });
    expect(addComment).not.toHaveBeenCalled();

    fireEvent.keyDown(box, { key: "Enter" });
    await waitFor(() =>
      expect(addComment).toHaveBeenCalledWith("p1", "nice", alice),
    );
    await waitFor(() => expect(box).toHaveValue(""));
  });
});
