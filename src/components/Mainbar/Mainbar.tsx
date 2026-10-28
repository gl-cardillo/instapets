import "./Mainbar.css";
import { useState, useRef, useEffect } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { IoHomeOutline, IoSearch, IoAddCircleOutline } from "react-icons/io5";
import { auth } from "../../firebase/config";
import { FirebaseError } from "firebase/app";
import { useAuth } from "../../auth/AuthContext";
import { deleteAccount, searchUsers } from "../../services/users";
import type { UserProfile } from "../../types";
import {
  askPassword,
  handleError,
  handleSuccess,
  reportError,
} from "../../utils/alerts";
import { Avatar } from "../Avatar/Avatar";
import { VerifyEmailBanner } from "../VerifyEmailBanner/VerifyEmailBanner";

export function Mainbar() {
  const navigate = useNavigate();
  const { profile, loading, emailVerified } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [searchText, setSearchText] = useState("");
  const [foundUsers, setFoundUsers] = useState<UserProfile[]>([]);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  // search once typing pauses, rather than on every key
  useEffect(() => {
    const text = searchText.trim();
    if (!text) return;
    let current = true;
    const timer = setTimeout(() => {
      searchUsers(text, 8)
        .then((users) => {
          if (current) setFoundUsers(users);
        })
        .catch(console.error);
    }, 300);
    return () => {
      current = false;
      clearTimeout(timer);
    };
  }, [searchText]);
  const searchResults = searchText.trim() ? foundUsers : [];

  const logoutUser = async () => {
    await signOut(auth);
    navigate("/login");
  };

  useEffect(() => {
    if (!dropdownVisible) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownVisible]);

  const confirmDeleteUser = async () => {
    if (!profile) return;
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

  // keeps the input focused when clicking a result, so the click lands
  // before the blur clears the results
  const keepFocus = (e: React.MouseEvent) => e.preventDefault();

  return (
    <div>
      <div className="main-bar">
        <Link to={"/home"}>
          <h1 className="title-home">Instapets</h1>
        </Link>
        <div className="search">
          <input
            type="text"
            id="search"
            value={searchText}
            placeholder="Search pets..."
            onChange={(e) => setSearchText(e.target.value)}
            onBlur={() => setSearchText("")}
          />
          <div className="search-result">
            {searchResults.map((user) => (
              <Link
                key={user.username}
                to={`/profile/${user.username}`}
                style={{ textDecoration: "none" }}
                onMouseDown={keepFocus}
                onClick={() => setSearchText("")}
              >
                <div className="result-user">
                  <Avatar src={user.profilePic} />
                  <p>{user.username}</p>
                </div>
              </Link>
            ))}
          </div>
          <Link
            to={`/searchPage?q=${encodeURIComponent(searchText)}`}
            onMouseDown={keepFocus}
            onClick={() => setSearchText("")}
          >
            <IoSearch className="search-icon" />
          </Link>
        </div>
        <div className="main-bar-buttons">
          <Link to={"/home"} className="home">
            <IoHomeOutline className="icons" />
          </Link>
          <Link to={"/uploadPost"}>
            <IoAddCircleOutline className="icons" />
          </Link>
          <div className="relative" ref={dropdownRef}>
            <div
              onClick={() => setDropdownVisible(!dropdownVisible)}
              className="cursor-pointer"
            >
              {profile ? (
                <Avatar src={profile.profilePic} />
              ) : loading ? (
                <Skeleton circle width={30} height={30} />
              ) : (
                <Link to="/login">Log in</Link>
              )}
            </div>
            {dropdownVisible && profile && (
              <div className="dropdown-menu">
                <Link
                  to={`/profile/${profile.username}`}
                  className="dropdown-item dp-1"
                >
                  Profile
                </Link>
                <button onClick={logoutUser} className="dropdown-item dp-2">
                  Log Out
                </button>
                <button
                  onClick={confirmDeleteUser}
                  className="dropdown-item dp-3"
                >
                  Delete Account
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {profile && !emailVerified && <VerifyEmailBanner />}
      <Outlet />
    </div>
  );
}
