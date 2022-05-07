import "./Profile.css";
import { useContext, useEffect, useState } from "react";
import { Card } from "../Card/Card";
import { TiPlusOutline } from "react-icons/ti";
import { Link, useParams } from "react-router-dom";
import { UserDataContext } from "../../dataContext/dataContext";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import {
  getPostsUser,
  getUserData,
  getUsers,
  addRemovefollow,
  changeProfilePic,
} from "../../utils/utils";

export function Profile() {
  const { userData, setUserData } = useContext(UserDataContext);
  const [userPosts, setUserPosts] = useState([]);
  const [render, setRender] = useState(false);
  const [userProfile, setUserProfile] = useState("");
  const [toShow, setToShow] = useState("posts");
  const [users, setUsers] = useState([]);

  let { profileName } = useParams();

  useEffect(() => {
    getUserData(setUserProfile, profileName);
    getPostsUser(setUserPosts, profileName);
    getUsers(setUsers);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileName, render]);

  return (
    <div className="main-page">
      <div className="profile-section">
        <div className="profile-picture">
          <label htmlFor="file-input">
            {userProfile ? (
              <div className="profile-pic-container">
                <img
                  src={userProfile.profilePic}
                  className={
                    profileName === userData.username ? "change-pic" : ""
                  }
                  alt="profile"
                />
                {userData.username === profileName ? (
                  <div className="overlay">
                    <TiPlusOutline className="icon" />
                  </div>
                ) : ( "" )}
              </div>
            ) : (
              <Skeleton circle width={80} height={80} />
            )}
          </label>
          {profileName === userData.username ? (
            <input
              type="file"
              id="file-input"
              onChange={(e) =>
                changeProfilePic(e.target.files[0], userData, setRender, render, setUserData)
              }
            />
          ) : ( "" )}
        </div>
        <div className="profile-details">
          <div className="name-follow">
            <h3>{userProfile.username || <Skeleton width={300} />}</h3>
            {profileName !== userData.username ? (
              <button
                className="follow-button"
                onClick={() =>
                  addRemovefollow(
                    profileName,
                    userData.username,
                    setRender,
                    render
                  )
                }
              >
                {userProfile ? (
                  userProfile.follower.includes(userData.username) ? (
                    "Unfollow"
                  ) : (
                    "Follow"
                  )
                ) : (
                  <Skeleton />
                )}
              </button>
            ) : ( "" )}
          </div>
          <div className="post-follower">
            <p onClick={() => setToShow("posts")}>{userPosts.length} posts</p>
            <p onClick={() => setToShow("follower")}>
              {userProfile ? (
                userProfile.follower.length
              ) : (
                <Skeleton width={10} />
              )}{" "}
              follower
            </p>
            <p onClick={() => setToShow("following")}>
              {userProfile ? (
                userProfile.following.length
              ) : (
                <Skeleton width={10} />
              )}{" "}
              following
            </p>
          </div>
        </div>
      </div>
      <div className="post-section">
        {toShow === "posts" ? (
          userPosts.length > 0 ? (
            userPosts.map((post, index) => (
              <Link to={`/post/${post.id}`} key={index}>
                <img className="post-pic" src={post.urlPic} alt="post" />
              </Link>
            ))
          ) : (
            <h4>No posts yet :(</h4>
          )
        ) : ( "" )}
      </div>
      {toShow === "follower" ? (
        <div className="foll-section">
          <h4>Follower</h4>
          {userProfile.follower.length > 0 ? (
            users
              .filter((user) => user.username.includes(userProfile.follower))
              .map((user, index) => {
                return <Card user={user} key={index} />;
              })
          ) : (
            <h5>No follower :(</h5>
          )}
        </div>
      ) : ( "" )}
      {toShow === "following" ? (
        <div className="foll-section">
          <h4>Following</h4>
          {userProfile.following.length > 0 ? (
            users
              .filter((user) => user.username.includes(userProfile.following))
              .map((user, index) => {
                return <Card user={user} key={index} />;
              })
          ) : (
            <h5>No following :(</h5>
          )}
        </div>
      ) : ( "" )}
    </div>
  );
}
