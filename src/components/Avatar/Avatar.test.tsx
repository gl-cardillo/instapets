import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Avatar, UserAvatar } from "./Avatar";
import defaultAvatar from "../../img/default-avatar.svg";
import type { UserProfile } from "../../types";

const user = vi.hoisted(() => ({
  current: undefined as UserProfile | null | undefined,
}));
vi.mock("../../hooks/useUser", () => ({ useUser: () => user.current }));

const pic = "data:image/webp;base64,AAAA";
// avatars are decorative, so they have no img role
const img = () => document.querySelector("img")!;

describe("Avatar", () => {
  it("is decorative, since a name is always shown beside it", () => {
    render(<Avatar src={pic} />);
    expect(img()).toHaveAttribute("alt", "");
  });

  it("shows the picture", () => {
    render(<Avatar src={pic} />);
    expect(img()).toHaveAttribute("src", pic);
  });

  it("shows the default when there's no picture", () => {
    render(<Avatar src="" />);
    expect(img()).toHaveAttribute("src", defaultAvatar);
  });

  it("falls back to the default when the picture fails to load", () => {
    render(<Avatar src="https://firebasestorage.example/gone.png" />);
    fireEvent.error(img());
    expect(img()).toHaveAttribute("src", defaultAvatar);
  });

  it("tries again when given a new picture after a failure", () => {
    const { rerender } = render(<Avatar src="https://broken.example/a.png" />);
    fireEvent.error(img());
    rerender(<Avatar src={pic} />);
    expect(img()).toHaveAttribute("src", pic);
  });
});

describe("UserAvatar", () => {
  it("shows the user's current picture", () => {
    user.current = { profilePic: pic } as UserProfile;
    render(
      <UserAvatar username="alice" fallback="https://old.example/a.png" />,
    );
    expect(img()).toHaveAttribute("src", pic);
  });

  it("uses the fallback while loading or when the user is gone", () => {
    user.current = null;
    render(<UserAvatar username="alice" fallback={pic} />);
    expect(img()).toHaveAttribute("src", pic);
  });
});
