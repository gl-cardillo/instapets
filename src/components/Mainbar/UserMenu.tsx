import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { FirebaseError } from "firebase/app";
import { signOut } from "firebase/auth";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useAuth } from "../../auth/AuthContext";
import { auth } from "../../firebase/config";
import { deleteAccount } from "../../services/users";
import {
  askPassword,
  handleError,
  handleSuccess,
  reportError,
} from "../../utils/alerts";
import { Avatar } from "../Avatar/Avatar";

const ITEM =
  "block w-full cursor-pointer px-4 py-2 text-left text-sm font-semibold hover:bg-surface-hover";

export function UserMenu() {
  const navigate = useNavigate();
  const { profile, loading } = useAuth();
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const closeOnClickOutside = (event: globalThis.MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    document.addEventListener("mousedown", closeOnClickOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnClickOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const logoutUser = async () => {
    setOpen(false);
    await signOut(auth);
    navigate("/login");
  };

  const confirmDeleteUser = async () => {
    if (!profile) return;
    setOpen(false);
    const password = await askPassword(
      "Delete your account and everything you posted? Enter your password to confirm.",
      "Delete",
    );
    if (password === null) return;
    try {
      await deleteAccount(profile.username, password);
      handleSuccess("Account deleted");
      navigate("/login");
    } catch (error) {
      if (
        error instanceof FirebaseError &&
        error.code === "auth/invalid-credential"
      ) {
        handleError("Wrong password, nothing was deleted");
      } else {
        reportError(error);
      }
    }
  };

  if (loading) return <Skeleton circle width={32} height={32} />;

  if (!profile) {
    return (
      <Link
        to="/login"
        className="rounded-control bg-primary px-3 py-1 text-sm font-bold text-on-primary hover:bg-primary-hover"
      >
        Log in
      </Link>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        ref={buttonRef}
        type="button"
        aria-label="Account menu"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="flex cursor-pointer rounded-pill focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <Avatar src={profile.profilePic} className="size-8" />
      </button>
      {open && (
        <div className="absolute right-0 z-30 mt-2 w-44 overflow-hidden rounded-card border border-line bg-surface py-1 shadow-card">
          <Link
            to={`/profile/${profile.username}`}
            onClick={() => setOpen(false)}
            className={`${ITEM} text-ink`}
          >
            Profile
          </Link>
          <button
            type="button"
            onClick={logoutUser}
            className={`${ITEM} text-ink`}
          >
            Log out
          </button>
          <button
            type="button"
            onClick={confirmDeleteUser}
            className={`${ITEM} text-danger`}
          >
            Delete account
          </button>
        </div>
      )}
    </div>
  );
}
