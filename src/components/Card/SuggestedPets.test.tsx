import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthContext, type AuthState } from "../../auth/AuthContext";
import { suggestPets, toggleFollow } from "../../services/users";
import type { UserProfile } from "../../types";
import { SuggestedPets } from "./SuggestedPets";

vi.mock("../../firebase/config", () => ({ auth: {}, db: {} }));
vi.mock("../../services/collections", () => ({}));
vi.mock("../../services/users", () => ({
  suggestPets: vi.fn(),
  toggleFollow: vi.fn(),
}));

const pet = (username: string) =>
  ({ username, profilePic: "", following: [] }) as unknown as UserProfile;
const alice = { ...pet("alice"), following: ["bob"] };

function renderSuggestions(profile: UserProfile | null = alice) {
  const refreshProfile = vi.fn(async () => {});
  const value = {
    authUser: null,
    profile,
    loading: false,
    emailVerified: true,
    refreshProfile,
    refreshEmailVerified: vi.fn(),
  } as AuthState;
  render(
    <MemoryRouter>
      <AuthContext.Provider value={value}>
        <SuggestedPets />
      </AuthContext.Provider>
    </MemoryRouter>,
  );
  return refreshProfile;
}

describe("SuggestedPets", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("suggests pets based on who you follow, and follows them", async () => {
    vi.mocked(suggestPets).mockResolvedValue([pet("carol"), pet("dave")]);
    vi.mocked(toggleFollow).mockResolvedValue();
    const refreshProfile = renderSuggestions();
    expect(await screen.findByText("Suggested for you")).toBeInTheDocument();
    expect(suggestPets).toHaveBeenCalledWith("alice", ["bob"]);

    fireEvent.click(screen.getByRole("button", { name: "Follow carol" }));
    await waitFor(() => expect(refreshProfile).toHaveBeenCalled());
    expect(toggleFollow).toHaveBeenCalledWith("carol", "alice", false);
  });

  it("shows nothing when there's no one to suggest", async () => {
    vi.mocked(suggestPets).mockResolvedValue([]);
    renderSuggestions();
    await waitFor(() => expect(suggestPets).toHaveBeenCalled());
    expect(screen.queryByText("Suggested for you")).not.toBeInTheDocument();
  });

  it("shows nothing to guests", () => {
    renderSuggestions(null);
    expect(suggestPets).not.toHaveBeenCalled();
    expect(screen.queryByText("Suggested for you")).not.toBeInTheDocument();
  });
});
