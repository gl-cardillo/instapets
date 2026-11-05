import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthContext, type AuthState } from "../../auth/AuthContext";
import { getComments } from "../../services/comments";
import { getPost, getPostsByUser } from "../../services/posts";
import { getUser, toggleFollow, updateBio } from "../../services/users";
import type { Post as PostType, UserProfile } from "../../types";
import { Post } from "../Post/Post";
import { UploadPost } from "../upload-post/UploadPost";
import { Profile } from "./Profile";

vi.mock("../../firebase/config", () => ({ auth: {}, db: {} }));
vi.mock("../../services/collections", () => ({}));
vi.mock("../../services/posts", () => ({
  getPost: vi.fn(),
  getPostsByUser: vi.fn(),
  addPost: vi.fn(),
  deletePost: vi.fn(),
  toggleLike: vi.fn(),
  updateCaption: vi.fn(),
}));
vi.mock("../../services/users", () => ({
  getUser: vi.fn(),
  toggleFollow: vi.fn(),
  changeProfilePic: vi.fn(),
  updateBio: vi.fn(),
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
  useUsers: () => [{ username: "bob", profilePic: "" }],
}));

const user = (username: string, extra = {}) =>
  ({
    username,
    profilePic: "",
    follower: [],
    following: [],
    ...extra,
  }) as unknown as UserProfile;
const alice = user("alice");

function renderAt(path: string, profile: UserProfile | null = alice) {
  const value = {
    authUser: null,
    profile,
    loading: false,
    emailVerified: true,
    refreshProfile: vi.fn(async () => {}),
    refreshEmailVerified: vi.fn(),
  } as unknown as AuthState;
  render(
    <MemoryRouter initialEntries={[path]}>
      <AuthContext.Provider value={value}>
        <Routes>
          <Route path="/profile/:profileName" element={<Profile />} />
          <Route path="/post/:postId" element={<Post />} />
          <Route path="/uploadPost" element={<UploadPost />} />
        </Routes>
      </AuthContext.Provider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getPostsByUser).mockResolvedValue([]);
  vi.mocked(getComments).mockResolvedValue([]);
});

describe("Profile", () => {
  it("says when the user doesn't exist", async () => {
    vi.mocked(getUser).mockResolvedValue(null);
    renderAt("/profile/ghost");
    expect(
      await screen.findByText("No pet called ghost here"),
    ).toBeInTheDocument();
  });

  it("switches between posts and followers", async () => {
    vi.mocked(getUser).mockResolvedValue(user("bob", { follower: ["bob"] }));
    renderAt("/profile/bob");
    expect(await screen.findByText("No posts yet")).toBeInTheDocument();
    const followers = screen.getByRole("button", { name: "1 follower" });
    fireEvent.click(followers);
    expect(followers).toHaveAttribute("aria-pressed", "true");
    expect(screen.queryByText("No posts yet")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /bob/ })).toBeInTheDocument();
  });

  it("lets you change your own picture, and only yours", async () => {
    vi.mocked(getUser).mockResolvedValue(alice);
    renderAt("/profile/alice");
    expect(
      await screen.findByLabelText("Change profile picture"),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Follow" }),
    ).not.toBeInTheDocument();
  });

  it("follows, blocking repeat clicks while saving", async () => {
    vi.mocked(getUser).mockResolvedValue(user("bob"));
    let finish = () => {};
    vi.mocked(toggleFollow).mockReturnValue(
      new Promise<void>((resolve) => (finish = resolve)),
    );
    renderAt("/profile/bob");
    const button = await screen.findByRole("button", { name: "Follow" });
    fireEvent.click(button);
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(toggleFollow).toHaveBeenCalledTimes(1);
    expect(toggleFollow).toHaveBeenCalledWith("bob", "alice", false);
    finish();
    expect(await screen.findByRole("button", { name: "Follow" })).toBeEnabled();
  });
});

describe("Bio", () => {
  it("shows a bio, with no way to edit someone else's", async () => {
    vi.mocked(getUser).mockResolvedValue(user("bob", { bio: "Loves naps" }));
    renderAt("/profile/bob");
    expect(await screen.findByText("Loves naps")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /bio/ }),
    ).not.toBeInTheDocument();
  });

  it("lets you add your own, trimmed, and shows it after saving", async () => {
    // saving changes what loading returns, like the real database
    let savedBio = "";
    vi.mocked(getUser).mockImplementation(async () =>
      user("alice", { bio: savedBio }),
    );
    vi.mocked(updateBio).mockImplementation(async (_, bio) => {
      savedBio = bio;
    });
    renderAt("/profile/alice");
    fireEvent.click(await screen.findByRole("button", { name: "Add a bio" }));
    const box = screen.getByRole("textbox", { name: "Bio" });
    fireEvent.change(box, { target: { value: "  Good boy  " } });
    expect(screen.getByText("12 / 150")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Edit bio" })).toBeVisible(),
    );
    expect(screen.getByText("Good boy")).toBeInTheDocument();
    expect(updateBio).toHaveBeenCalledWith("alice", "Good boy");
  });

  it("cancels without saving", async () => {
    vi.mocked(getUser).mockResolvedValue(alice);
    renderAt("/profile/alice");
    fireEvent.click(await screen.findByRole("button", { name: "Add a bio" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(updateBio).not.toHaveBeenCalled();
    expect(
      screen.queryByRole("textbox", { name: "Bio" }),
    ).not.toBeInTheDocument();
  });
});

describe("Post", () => {
  const post = {
    id: "p1",
    user: "alice",
    userPic: "",
    caption: "",
    urlPic: "",
    likes: [],
    created: 1,
  } as PostType;

  it("has one delete button for its author", async () => {
    vi.mocked(getPost).mockResolvedValue(post);
    renderAt("/post/p1");
    expect(
      await screen.findAllByRole("button", { name: "Delete post" }),
    ).toHaveLength(1);
  });

  it("says when the post is gone", async () => {
    vi.mocked(getPost).mockResolvedValue(null);
    renderAt("/post/p1");
    expect(
      await screen.findByText("This post doesn't exist anymore"),
    ).toBeInTheDocument();
  });
});

describe("UploadPost", () => {
  it("can't post until a picture is chosen", () => {
    renderAt("/uploadPost");
    expect(screen.getByRole("button", { name: "Post" })).toBeDisabled();
    expect(screen.getByLabelText("Choose a picture")).toBeInTheDocument();
  });
});
