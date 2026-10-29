import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Avatar, UserAvatar } from "./Avatar";
import defaultAvatar from "../../img/default-avatar.svg";
import type { UserProfile } from "../../types";

const user = vi.hoisted(() => ({ current: undefined as UserProfile | null | undefined }));
vi.mock("../../hooks/useUser", () => ({ useUser: () => user.current }));

const pic = "data:image/webp;base64,AAAA";

describe("Avatar", () => {
  it("shows the picture", () => {
    render(<Avatar src={pic} />);
    expect(screen.getByRole("img")).toHaveAttribute("src", pic);
  });

  it("shows the default when there's no picture", () => {
    render(<Avatar src="" />);
    expect(screen.getByRole("img")).toHaveAttribute("src", defaultAvatar);
  });

  it("falls back to the default when the picture fails to load", () => {
    render(<Avatar src="https://firebasestorage.example/gone.png" />);
    fireEvent.error(screen.getByRole("img"));
    expect(screen.getByRole("img")).toHaveAttribute("src", defaultAvatar);
  });

  it("tries again when given a new picture after a failure", () => {
    const { rerender } = render(<Avatar src="https://broken.example/a.png" />);
    fireEvent.error(screen.getByRole("img"));
    rerender(<Avatar src={pic} />);
    expect(screen.getByRole("img")).toHaveAttribute("src", pic);
  });
});

describe("UserAvatar", () => {
  it("shows the user's current picture", () => {
    user.current = { profilePic: pic } as UserProfile;
    render(<UserAvatar username="alice" fallback="https://old.example/a.png" />);
    expect(screen.getByRole("img")).toHaveAttribute("src", pic);
  });

  it("uses the fallback while loading or when the user is gone", () => {
    user.current = null;
    render(<UserAvatar username="alice" fallback={pic} />);
    expect(screen.getByRole("img")).toHaveAttribute("src", pic);
  });
});
