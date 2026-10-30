import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import App from "./App";
import { AuthContext, type AuthState } from "./auth/AuthContext";

// the pages below the top bar never load in these tests, so no Firebase calls
vi.mock("./firebase/config", () => ({ auth: {}, db: {} }));
vi.mock("./services/collections", () => ({}));

const guest: AuthState = {
  authUser: null,
  profile: null,
  loading: false,
  emailVerified: false,
  refreshProfile: vi.fn(),
  refreshEmailVerified: vi.fn(),
};

function renderAt(hash: string) {
  window.location.hash = hash;
  render(
    <AuthContext.Provider value={guest}>
      <App />
    </AuthContext.Provider>,
  );
}

describe("routing", () => {
  it("shows a not found page for unknown URLs, with the top bar", () => {
    renderAt("#/no/such/page");
    expect(screen.getByText("Page not found")).toBeInTheDocument();
    expect(screen.getByText("Back to the feed")).toHaveAttribute(
      "href",
      "#/home",
    );
    expect(screen.getByPlaceholderText("Search pets...")).toBeInTheDocument();
  });
});
