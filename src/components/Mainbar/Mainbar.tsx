import "./Mainbar.css";
import { useState, useRef, useEffect } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { IoHomeOutline, IoSearch, IoAddCircleOutline } from "react-icons/io5";
import { auth } from "../../firebase/config";
import { useAuth } from "../../auth/AuthContext";
import { deleteAccount } from "../../services/users";
import { confirmDelete, handleSuccess, reportError } from "../../utils/alerts";
import { Avatar } from "../Avatar/Avatar";

export function Mainbar() {
  const navigate = useNavigate();
  const { profile, loading, users, refreshUsers } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [searchText, setSearchText] = useState("");
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const search = searchText.toLowerCase().trim();
  const searchResults = search
    ? users.filter((user) => user.username.toLowerCase().includes(search))
    : [];

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
    if (!(await confirmDelete("Are you sure you want to delete your account?")))
      return;
    try {
      await deleteAccount(profile.username);
      handleSuccess("Account deleted");
      navigate("/login");
      await refreshUsers();
    } catch (error) {
      reportError(error);
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
      <Outlet />
    </div>
  );
}
