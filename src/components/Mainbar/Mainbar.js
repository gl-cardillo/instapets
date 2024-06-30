import "./Mainbar.css";
import { useContext, useState, useRef, useEffect } from "react";
import { UserDataContext } from "../../dataContext/dataContext";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/config";
import {
  blur,
  handleSearch,
  RemoveUser,
  swalStyle,
  handleSuccess,
} from "../../utils/utils";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import {
  IoHomeOutline,
  IoExitOutline,
  IoSearch,
  IoAddCircleOutline,
} from "react-icons/io5";
import Swal from "sweetalert2";

export function Mainbar() {
  let navigate = useNavigate();
  const { userData, setUserData, users } = useContext(UserDataContext);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const [search, setSearch] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const logoutUser = async () => {
    await signOut(auth);
    navigate("/login");
    if (userData.username !== "anon") setUserData("");
  };

  const handleProfileClick = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setDropdownVisible(false);
    }
  };

  useEffect(() => {
    if (dropdownVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownVisible]);

  const confirmDeleteUser = () => {
    Swal.fire({
      title: "Are you sure you want to delete this user?",
      position: "top",
      showCancelButton: true,
      confirmButtonText: "Close",
      cancelButtonText: "Delete",
      ...swalStyle,
    }).then((result) => {
      if (result.isDismissed) {
        RemoveUser(userData.username);

        Swal.close();
        handleSuccess("Account deleted");
      } else {
        Swal.close();
      }
    });
  };

  return (
    <div>
      <div className="main-bar">
        <Link to={"/home"}>
          <h1 className="title-home">Instapets</h1>
        </Link>
        <div className="search" onBlur={() => blur(inputRef, setSearch)}>
          <input
            type="text"
            id="search"
            ref={inputRef}
            placeholder="Search pets..."
            onChange={(e) => handleSearch(e, setSearch, users)}
            onFocus={() => setExpanded(true)}
          />
          <div className="search-result">
            {expanded
              ? search.map((user, index) => (
                  <Link
                    key={index}
                    to={`/profile/${user.username}`}
                    style={{ textDecoration: "none" }}
                    onClick={() => {
                      inputRef.current.value = "";
                      setSearch([]);
                    }}
                  >
                    <div className="result-user">
                      <img
                        src={user.profilePic}
                        alt="avatar"
                        className="avatar"
                      />
                      <p>{user.username}</p>
                    </div>
                  </Link>
                ))
              : ""}
          </div>
          <Link to="/searchPage" state={{ search }}>
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
          <IoExitOutline onClick={logoutUser} className="icons" />
          <div className="relative" ref={dropdownRef}>
            <div onClick={handleProfileClick} className="cursor-pointer">
              {userData.profilePic ? (
                <img
                  src={userData.profilePic}
                  alt="avatar"
                  className="avatar"
                />
              ) : (
                <Skeleton circle width={30} height={30} />
              )}
            </div>
            {dropdownVisible && (
              <div className="dropdown-menu">
                <Link
                  to={`/profile/${userData.username}`}
                  className="dropdown-item dp-1"
                >
                  Profile
                </Link>
                <button onClick={logoutUser} className="dropdown-item dp-2">
                  Log Out
                </button>
                {userData.username !== "anon" && (
                  <button
                    onClick={confirmDeleteUser}
                    className="dropdown-item dp-3"
                  >
                    Delete Account
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <Outlet />
    </div>
  );
}
