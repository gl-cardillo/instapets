import "./Profile.css";
import { useContext, useEffect, useState } from "react";
import { Card } from "../Card/Card";
import { TiPlusOutline } from "react-icons/ti";
import { Link, useParams, useNavigate } from "react-router-dom";
import { UserDataContext } from "../../dataContext/dataContext";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import {
  getPostsUser,
  getUserData,
  addRemovefollow,
  changeProfilePic,
} from "../../utils/utils";

export function Profile() {
  const { userData, setUserData, users } = useContext(UserDataContext);
  const [userPosts, setUserPosts] = useState([]);
  const [render, setRender] = useState(false);
  const [userProfile, setUserProfile] = useState("");
  const [toShow, setToShow] = useState("posts");

  let { profileName } = useParams();

  useEffect(() => {
    getUserData(setUserProfile, profileName);
    getPostsUser(setUserPosts, profileName);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    setTimeout(() => {
      setToShow("posts");
    }, 100);
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
                    profileName === userData.username
                      ? "change-pic avatar"
                      : "avatar"
                  }
                  alt="profile"
                />
                {userData.username === profileName ? (
                  <div className="overlay">
                    <TiPlusOutline className="icon" />
                  </div>
                ) : (
                  ""
                )}
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
                changeProfilePic(
                  e.target.files[0],
                  userData,
                  setRender,
                  render,
                  setUserData
                )
              }
            />
          ) : (
            ""
          )}
        </div>
        <div className="profile-details">
          <div className="name-follow">
            <h3>{userProfile.username || <Skeleton width={300} />}</h3>
            {profileName !== userData.username ? (
              <button
                className="follow button"
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
            ) : (
              ""
            )}
          </div>
          <div className="post-follower">
            <p onClick={() => setToShow("posts")}>
              {userPosts.length} post{userPosts.length !== 1 && "s"}
            </p>
            <p onClick={() => setToShow("follower")}>
              {userProfile.follower ? (
                userProfile.follower.length
              ) : (
                <Skeleton width={10} />
              )}{" "}
              Follower{userProfile.follower?.length !== 1 && "s"}
            </p>
            <p onClick={() => setToShow("following")}>
              {userProfile ? (
                userProfile.following.length
              ) : (
                <Skeleton width={10} />
              )}{" "}
              Following
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
            <p>No posts yet </p>
          )
        ) : (
          ""
        )}
      </div>
      {toShow === "follower" ? (
        <div className="foll-section">
          <h4>Follower</h4>
          {userProfile.follower.length > 0 ? (
            users
              .filter((user) => userProfile.follower.includes(user.username))
              .map((user, index) => {
                return <Card user={user} key={index} />;
              })
          ) : (
            <p>No follower </p>
          )}
        </div>
      ) : (
        ""
      )}
      {toShow === "following" ? (
        <div className="foll-section">
          <h4>Following</h4>
          {userProfile.following.length > 0 ? (
            users
              .filter((user) => userProfile.following.includes(user.username))
              .map((user, index) => {
                return <Card user={user} key={index} />;
              })
          ) : (
            <h5>No following :(</h5>
          )}
        </div>
      ) : (
        ""
      )}
    </div>
  );
}
