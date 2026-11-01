import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { AuthContext, type AuthState } from "../../auth/AuthContext";
import type { UserProfile } from "../../types";
import { Mainbar } from "./Mainbar";

vi.mock("../../firebase/config", () => ({ auth: {}, db: {} }));
vi.mock("../../services/collections", () => ({}));

const alice = { username: "alice", profilePic: "" } as UserProfile;

function renderBar(state: Partial<AuthState> = {}, path = "/home") {
  const value = {
    authUser: null,
    profile: null,
    loading: false,
    emailVerified: true,
    refreshProfile: vi.fn(),
    refreshEmailVerified: vi.fn(),
    ...state,
  } as AuthState;
  render(
    <MemoryRouter initialEntries={[path]}>
      <AuthContext.Provider value={value}>
        <Mainbar />
      </AuthContext.Provider>
    </MemoryRouter>,
  );
}

const tabs = () => screen.getByRole("navigation", { name: "Main" });

describe("Mainbar", () => {
  it("offers guests the login page", () => {
    renderBar();
    const links = screen.getAllByRole("link", { name: "Log in" });
    expect(links).toHaveLength(2);
    links.forEach((link) => expect(link).toHaveAttribute("href", "/login"));
    expect(tabs()).toContainElement(links[1]);
    expect(
      screen.queryByRole("button", { name: "Account menu" }),
    ).not.toBeInTheDocument();
  });

  it("links the profile tab to the signed-in user", () => {
    renderBar({ profile: alice });
    expect(screen.getByRole("link", { name: "Profile" })).toHaveAttribute(
      "href",
      "/profile/alice",
    );
  });

  it("marks the current tab", () => {
    renderBar({ profile: alice }, "/searchPage");
    const [, search] = tabs().querySelectorAll("a");
    expect(search).toHaveClass("text-primary");
    expect(tabs().querySelector("a")).not.toHaveClass("text-primary");
  });

  it("opens the account menu, and closes it with Escape or a click outside", () => {
    renderBar({ profile: alice });
    const button = screen.getByRole("button", { name: "Account menu" });
    expect(screen.queryByText("Log out")).not.toBeInTheDocument();

    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Delete account")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByText("Log out")).not.toBeInTheDocument();

    fireEvent.click(button);
    fireEvent.mouseDown(document.body);
    expect(screen.queryByText("Log out")).not.toBeInTheDocument();
  });

  it("closes the account menu when following a link in it", () => {
    renderBar({ profile: alice });
    fireEvent.click(screen.getByRole("button", { name: "Account menu" }));
    fireEvent.click(screen.getAllByRole("link", { name: "Profile" })[0]);
    expect(screen.queryByText("Log out")).not.toBeInTheDocument();
  });

  it("asks unverified users to verify their email", () => {
    renderBar({ profile: alice, emailVerified: false });
    expect(screen.getByText(/Verify your email/)).toBeInTheDocument();
  });
});
