import type { ReactNode } from "react";
import { Link, Outlet } from "react-router";
import { IoAddCircleOutline, IoHomeOutline } from "react-icons/io5";
import { useAuth } from "../../auth/AuthContext";
import { ThemeToggle } from "../ThemeToggle/ThemeToggle";
import { VerifyEmailBanner } from "../VerifyEmailBanner/VerifyEmailBanner";
import { BottomNav } from "./BottomNav";
import { SearchBox } from "./SearchBox";
import { UserMenu } from "./UserMenu";

function HeaderLink({
  to,
  label,
  children,
}: {
  to: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <Link
      to={to}
      aria-label={label}
      title={label}
      className="hidden rounded-pill text-ink transition-colors hover:text-primary md:flex"
    >
      {children}
    </Link>
  );
}

export function Mainbar() {
  const { profile, emailVerified } = useAuth();

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-line bg-surface">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4">
          <Link to="/home">
            <h1 className="font-logo text-4xl leading-none font-bold text-ink">
              Instapets
            </h1>
          </Link>
          <SearchBox className="hidden md:block" />
          <div className="flex items-center gap-4">
            <HeaderLink to="/home" label="Home">
              <IoHomeOutline className="size-6" />
            </HeaderLink>
            <HeaderLink to="/uploadPost" label="New post">
              <IoAddCircleOutline className="size-7" />
            </HeaderLink>
            <ThemeToggle />
            <UserMenu />
          </div>
        </div>
      </header>
      {profile && !emailVerified && <VerifyEmailBanner />}
      <main className="flex-1">
        <Outlet />
      </main>
      <BottomNav />
    </>
  );
}
