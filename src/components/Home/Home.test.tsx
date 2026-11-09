import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthContext, type AuthState } from "../../auth/AuthContext";
import {
  addComment,
  deleteComment,
  getComments,
} from "../../services/comments";
import { getFeed, getFollowingFeed, updateCaption } from "../../services/posts";
import type { Post, PostComment, UserProfile } from "../../types";
import { confirmDelete, reportError } from "../../utils/alerts";
import { forgetSaved } from "../../hooks/useSaved";
import { getSavedIds, setSaved } from "../../services/saves";
import { Home } from "./Home";
import { PostCard } from "./PostCard";

vi.mock("../../firebase/config", () => ({ auth: {}, db: {} }));
vi.mock("../../services/collections", () => ({}));
vi.mock("../../services/posts", () => ({
  getFeed: vi.fn(),
  getFollowingFeed: vi.fn(),
  deletePost: vi.fn(),
  toggleLike: vi.fn(),
  updateCaption: vi.fn(),
}));
vi.mock("../../services/comments", () => ({
  getComments: vi.fn(),
  addComment: vi.fn(),
  deleteComment: vi.fn(),
}));
vi.mock("../../services/saves", () => ({
  getSavedIds: vi.fn(async () => []),
  setSaved: vi.fn(),
}));
vi.mock("../../services/images", () => ({
  getPostImage: async () => "data:image/webp;base64,AAAA",
}));
vi.mock("../../hooks/useUser", () => ({
  useUser: () => null,
  useUsers: () => [],
}));
vi.mock("../../utils/alerts", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../utils/alerts")>()),
  confirmDelete: vi.fn(),
  reportError: vi.fn(),
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

  it("only offers the following tab when signed in", async () => {
    vi.mocked(getFeed).mockResolvedValue({ posts: [], next: null });
    withAuth(<Home />, null);
    await screen.findByText("No pets here yet");
    expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
  });

  it("switches to posts from pets you follow", async () => {
    vi.mocked(getFeed).mockResolvedValue({ posts: [], next: null });
    vi.mocked(getFollowingFeed).mockResolvedValue({
      posts: [post({ user: "bob", caption: "bob's nap" })],
      next: null,
    });
    withAuth(<Home />, { ...alice, following: ["bob", "carol"] });
    const tab = await screen.findByRole("tab", { name: "Following" });
    expect(screen.getByRole("tab", { name: "Everyone" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    fireEvent.click(tab);
    expect(await screen.findByText("bob's nap")).toBeInTheDocument();
    expect(tab).toHaveAttribute("aria-selected", "true");
    expect(getFollowingFeed).toHaveBeenCalledWith(["bob", "carol"], null);
  });

  it("suggests finding pets when you follow no one", async () => {
    vi.mocked(getFeed).mockResolvedValue({ posts: [], next: null });
    vi.mocked(getFollowingFeed).mockResolvedValue({ posts: [], next: null });
    withAuth(<Home />, { ...alice, following: [] });
    fireEvent.click(await screen.findByRole("tab", { name: "Following" }));
    expect(
      await screen.findByText("You're not following anyone yet"),
    ).toBeInTheDocument();
    expect(screen.getByText("Find pets to follow")).toHaveAttribute(
      "href",
      "/searchPage",
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

  it("lets the author edit the caption", async () => {
    vi.mocked(updateCaption).mockResolvedValue();
    const onPostChange = vi.fn();
    withAuth(
      <PostCard post={post()} onPostChange={onPostChange} onDelete={vi.fn()} />,
    );
    fireEvent.click(
      await screen.findByRole("button", { name: "Edit caption" }),
    );
    const box = screen.getByRole("textbox", { name: "Caption" });
    expect(box).toHaveValue("my cat");
    fireEvent.change(box, { target: { value: " my sleepy cat " } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() =>
      expect(onPostChange).toHaveBeenCalledWith(
        expect.objectContaining({ caption: "my sleepy cat" }),
      ),
    );
    expect(updateCaption).toHaveBeenCalledWith("p1", "my sleepy cat");
    expect(
      screen.queryByRole("textbox", { name: "Caption" }),
    ).not.toBeInTheDocument();
  });

  it("only shows caption editing to the author", async () => {
    card(post({ user: "bob" }));
    await screen.findByText("my cat");
    expect(
      screen.queryByRole("button", { name: "Edit caption" }),
    ).not.toBeInTheDocument();
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

  it("asks before deleting your comment", async () => {
    vi.mocked(getComments).mockResolvedValue([
      { commentId: "c1", username: "alice", text: "cute", created: 1 },
    ] as PostComment[]);
    card(post());
    fireEvent.click(
      await screen.findByRole("button", { name: "View 1 comment" }),
    );
    const remove = screen.getByRole("button", { name: "Delete comment" });

    vi.mocked(confirmDelete).mockResolvedValue(false);
    fireEvent.click(remove);
    await waitFor(() => expect(confirmDelete).toHaveBeenCalledOnce());
    expect(deleteComment).not.toHaveBeenCalled();

    vi.mocked(confirmDelete).mockResolvedValue(true);
    fireEvent.click(remove);
    await waitFor(() =>
      expect(deleteComment).toHaveBeenCalledWith("c1", "alice"),
    );
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

describe("Saving posts", () => {
  beforeEach(() => {
    forgetSaved();
    vi.mocked(getComments).mockResolvedValue([]);
    vi.mocked(getSavedIds).mockResolvedValue([]);
    vi.mocked(setSaved).mockReset();
  });

  it("saves a post and shows it saved", async () => {
    vi.mocked(setSaved).mockResolvedValue();
    card(post({ user: "bob" }));
    const button = await screen.findByRole("button", { name: "Save post" });
    expect(button).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(button);
    expect(
      screen.getByRole("button", { name: "Remove from saved" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(setSaved).toHaveBeenCalledWith("alice", "p1", true);
  });

  it("shows posts you saved before, and unsaves them", async () => {
    vi.mocked(getSavedIds).mockResolvedValue(["p1"]);
    vi.mocked(setSaved).mockResolvedValue();
    card(post({ user: "bob" }));
    fireEvent.click(
      await screen.findByRole("button", { name: "Remove from saved" }),
    );
    expect(screen.getByRole("button", { name: "Save post" })).toBeVisible();
    expect(setSaved).toHaveBeenCalledWith("alice", "p1", false);
  });

  it("goes back if saving fails", async () => {
    vi.mocked(setSaved).mockRejectedValue(new Error("offline"));
    card(post({ user: "bob" }));
    fireEvent.click(await screen.findByRole("button", { name: "Save post" }));
    expect(
      await screen.findByRole("button", { name: "Save post" }),
    ).toHaveAttribute("aria-pressed", "false");
    expect(reportError).toHaveBeenCalled();
  });
});
