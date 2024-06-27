import "./Mainbar.css";
import { useContext, useState, useRef } from "react";
import { UserDataContext } from "../../dataContext/dataContext";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/config";
import { blur, handleSearch } from "../../utils/utils";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import {
  IoHomeOutline,
  IoExitOutline,
  IoSearch,
  IoAddCircleOutline,
} from "react-icons/io5";

export function Mainbar() {
  let navigate = useNavigate();

  const { userData, setUserData, users } = useContext(UserDataContext);
  //use to set input value to empty
  const inputRef = useRef(null);
  const [search, setSearch] = useState([]);
  //use for remove the searchresult when user click somewhere else in the page
  const [expanded, setExpanded] = useState(false);

  const logoutUser = async () => {
    await signOut(auth);
    navigate("/login");
    if (userData.username !== "anon") setUserData("");
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
              ? search.map((user, index) => {
                  return (
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
                        <img src={user.profilePic} alt="avatar" className="avatar" />
                        <p>{user.username}</p>
                      </div>
                    </Link>
                  );
                })
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
          <IoExitOutline onClick={() => logoutUser()} className="icons" />
          <Link to={`/profile/${userData.username}`}>
            {userData.profilePic ? (
              <img src={userData.profilePic} alt="avatar" className="avatar" />
            ) : (
              <Skeleton circle width={30} height={30} />
            )}
          </Link>
        </div>
      </div>
      <Outlet />
    </div>
  );
}