import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeToggle } from "../ThemeToggle/ThemeToggle";
import { Button } from "./Button";
import { IconButton } from "./IconButton";
import { TextField } from "./TextField";

describe("Button", () => {
  it("doesn't submit forms unless asked to", () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });

  it("passes clicks and disabled through", () => {
    const onClick = vi.fn();
    const { rerender } = render(<Button onClick={onClick}>Save</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
    rerender(<Button disabled>Save</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });
});

describe("IconButton", () => {
  it("is named for screen readers", () => {
    render(<IconButton label="Close">x</IconButton>);
    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
  });
});

describe("TextField", () => {
  it("ties the label to the input", () => {
    render(<TextField label="Email" />);
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });

  it("shows errors and marks the input invalid", () => {
    render(<TextField label="Email" error="Email is required" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Email is required");
    expect(screen.getByLabelText("Email")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  it("isn't invalid without an error", () => {
    render(<TextField label="Email" />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Email")).not.toHaveAttribute("aria-invalid");
  });
});

describe("ThemeToggle", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.dataset.theme = "light";
  });

  it("switches theme and remembers the choice", () => {
    render(<ThemeToggle />);
    fireEvent.click(
      screen.getByRole("button", { name: "Switch to dark mode" }),
    );
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(localStorage.getItem("theme")).toBe("dark");

    fireEvent.click(
      screen.getByRole("button", { name: "Switch to light mode" }),
    );
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(localStorage.getItem("theme")).toBe("light");
  });
});
