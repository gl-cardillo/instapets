import type { ReactNode } from "react";
import { NavLink } from "react-router";
import {
  IoAddCircleOutline,
  IoHomeOutline,
  IoPersonOutline,
  IoSearch,
} from "react-icons/io5";
import { useAuth } from "../../auth/AuthContext";

function Tab({
  to,
  label,
  children,
}: {
  to: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <NavLink
      to={to}
      aria-label={label}
      className={({ isActive }) =>
        `flex flex-1 items-center justify-center ${isActive ? "text-primary" : "text-ink"}`
      }
    >
      {children}
    </NavLink>
  );
}

// main navigation on phones
export function BottomNav() {
  const { profile } = useAuth();

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-20 flex h-14 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <Tab to="/home" label="Home">
        <IoHomeOutline className="size-6" />
      </Tab>
      <Tab to="/searchPage" label="Search">
        <IoSearch className="size-6" />
      </Tab>
      <Tab to="/uploadPost" label="New post">
        <IoAddCircleOutline className="size-7" />
      </Tab>
      <Tab
        to={profile ? `/profile/${profile.username}` : "/login"}
        label={profile ? "Profile" : "Log in"}
      >
        <IoPersonOutline className="size-6" />
      </Tab>
    </nav>
  );
}
