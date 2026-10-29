import "./Profile.css";
import { useCallback, useState } from "react";
import { Link, useParams } from "react-router";
import { TiPlusOutline } from "react-icons/ti";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useAuth, useCanWrite } from "../../auth/AuthContext";
import { useLoader } from "../../hooks/useLoader";
import { getPostsByUser } from "../../services/posts";
import { changeProfilePic, getUser, toggleFollow } from "../../services/users";
import { reportError } from "../../utils/alerts";
import { Avatar } from "../Avatar/Avatar";
import { UserCards } from "../Card/UserCards";
import { PostImage } from "../PostImage/PostImage";

export function Profile() {
  const { profileName = "" } = useParams();
  // remount per profile so state from the previous one never shows
  return <ProfilePage key={profileName} profileName={profileName} />;
}

function ProfilePage({ profileName }: { profileName: string }) {
  const { profile, refreshProfile } = useAuth();
  const canWrite = useCanWrite();
  const { data, reload: load } = useLoader(
    useCallback(
      () => Promise.all([getUser(profileName), getPostsByUser(profileName)]),
      [profileName],
    ),
  );
  // undefined while loading, null if the user doesn't exist
  const userProfile = data?.[0];
  const userPosts = data?.[1] ?? [];
  const [toShow, setToShow] = useState<"posts" | "follower" | "following">(
    "posts",
  );

  const isOwnProfile = profile?.username === profileName;

  const onPicChosen = async (file: File | undefined) => {
    if (!file || !canWrite()) return;
    try {
      await changeProfilePic(file, profileName);
      await Promise.all([load(), refreshProfile()]);
    } catch (error) {
      reportError(error);
    }
  };

  const onFollowClick = async () => {
    const me = canWrite();
    if (!me || !userProfile) return;
    try {
      await toggleFollow(
        profileName,
        me.username,
        userProfile.follower.includes(me.username),
      );
      await Promise.all([load(), refreshProfile()]);
    } catch (error) {
      reportError(error);
    }
  };

  if (userProfile === null) {
    return (
      <div className="main-page">
        <p>No pet called {profileName} here.</p>
      </div>
    );
  }

  return (
    <div className="main-page">
      <div className="profile-section">
        <div className="profile-picture">
          <label htmlFor="file-input">
            {userProfile ? (
              <div className="profile-pic-container">
                <Avatar
                  src={userProfile.profilePic}
                  className={isOwnProfile ? "change-pic avatar" : "avatar"}
                  alt="profile"
                />
                {isOwnProfile && (
                  <div className="overlay">
                    <TiPlusOutline className="icon" />
                  </div>
                )}
              </div>
            ) : (
              <Skeleton circle width={80} height={80} />
            )}
          </label>
          {isOwnProfile && (
            <input
              type="file"
              id="file-input"
              accept="image/*"
              onChange={(e) => onPicChosen(e.target.files?.[0])}
            />
          )}
        </div>
        <div className="profile-details">
          <div className="name-follow">
            <h3>{userProfile?.username || <Skeleton width={300} />}</h3>
            {profile && !isOwnProfile && (
              <button className="follow button" onClick={onFollowClick}>
                {userProfile ? (
                  userProfile.follower.includes(profile.username) ? (
                    "Unfollow"
                  ) : (
                    "Follow"
                  )
                ) : (
                  <Skeleton />
                )}
              </button>
            )}
          </div>
          <div className="post-follower">
            <p onClick={() => setToShow("posts")}>
              {userPosts.length} post{userPosts.length !== 1 && "s"}
            </p>
            <p onClick={() => setToShow("follower")}>
              {userProfile ? (
                userProfile.follower.length
              ) : (
                <Skeleton width={10} />
              )}{" "}
              Follower{userProfile?.follower.length !== 1 && "s"}
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
        {toShow === "posts" &&
          (userPosts.length > 0 ? (
            userPosts.map((post) => (
              <Link to={`/post/${post.id}`} key={post.id}>
                <PostImage post={post} className="post-pic" />
              </Link>
            ))
          ) : (
            <p>No posts yet </p>
          ))}
      </div>
      {toShow === "follower" && userProfile && (
        <div className="foll-section">
          <h4>Follower</h4>
          {userProfile.follower.length > 0 ? (
<UserCards usernames={userProfile.follower} />
          ) : (
            <p>No follower </p>
          )}
        </div>
      )}
      {toShow === "following" && userProfile && (
        <div className="foll-section">
          <h4>Following</h4>
          {userProfile.following.length > 0 ? (
<UserCards usernames={userProfile.following} />
          ) : (
            <h5>No following :(</h5>
          )}
        </div>
      )}
    </div>
  );
}
