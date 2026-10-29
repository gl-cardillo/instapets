import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { UserProfile } from "../types";
import { handleError } from "../utils/alerts";
import { AuthContext, useCanWrite, type AuthState } from "./AuthContext";

vi.mock("../utils/alerts", () => ({ handleError: vi.fn() }));
const navigate = vi.fn();
vi.mock("react-router", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router")>()),
  useNavigate: () => navigate,
}));

const alice = { username: "alice" } as UserProfile;

function canWriteWith(state: Partial<AuthState>) {
  const value = {
    authUser: null,
    profile: null,
    loading: false,
    emailVerified: false,
    refreshProfile: vi.fn(),
    refreshEmailVerified: vi.fn(),
    ...state,
  } as AuthState;
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter>
      <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    </MemoryRouter>
  );
  return renderHook(() => useCanWrite(), { wrapper }).result.current;
}

describe("useCanWrite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sends guests to the login page", () => {
    expect(canWriteWith({})()).toBeNull();
    expect(navigate).toHaveBeenCalledWith("/login");
  });

  it("asks unverified users to verify their email", () => {
    expect(canWriteWith({ profile: alice })()).toBeNull();
    expect(handleError).toHaveBeenCalledWith(expect.stringMatching(/verify/i));
    expect(navigate).not.toHaveBeenCalled();
  });

  it("returns the profile of verified users", () => {
    expect(canWriteWith({ profile: alice, emailVerified: true })()).toBe(alice);
    expect(handleError).not.toHaveBeenCalled();
  });
});
