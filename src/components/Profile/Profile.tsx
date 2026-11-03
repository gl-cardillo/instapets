import { useCallback, useState } from "react";
import { Link, useParams } from "react-router";
import { IoCameraOutline } from "react-icons/io5";
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
import { Button } from "../ui/Button";
import { Notice } from "../ui/Notice";

const PAGE = "mx-auto flex w-full max-w-3xl flex-col gap-6 p-4";
const AVATAR = "size-20 md:size-28";

type Tab = "posts" | "follower" | "following";

interface StatProps {
  label: string;
  count: number | undefined;
  active: boolean;
  onClick: () => void;
}

function Stat({ label, count, active, onClick }: StatProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`cursor-pointer border-b-2 pb-1 text-sm hover:text-primary md:text-base ${
        active ? "border-primary text-ink" : "border-transparent text-muted"
      }`}
    >
      <span className="font-bold text-ink">
        {count ?? <Skeleton width={10} />}
      </span>{" "}
      {label}
    </button>
  );
}

export function Profile() {
  const { profileName = "" } = useParams();
  // remount per profile so no old state shows
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
  const userPosts = data?.[1];
  const [toShow, setToShow] = useState<Tab>("posts");
  // blocks repeat clicks while saving
  const [busy, setBusy] = useState(false);

  const isOwnProfile = profile?.username === profileName;
  const isFollowing =
    profile !== null && userProfile?.follower.includes(profile.username);

  const onPicChosen = async (file: File | undefined) => {
    if (!file || !canWrite()) return;
    setBusy(true);
    try {
      await changeProfilePic(file, profileName);
      await Promise.all([load(), refreshProfile()]);
    } catch (error) {
      reportError(error);
    } finally {
      setBusy(false);
    }
  };

  const onFollowClick = async () => {
    const me = canWrite();
    if (!me || !userProfile) return;
    setBusy(true);
    try {
      await toggleFollow(profileName, me.username, !!isFollowing);
      await Promise.all([load(), refreshProfile()]);
    } catch (error) {
      reportError(error);
    } finally {
      setBusy(false);
    }
  };

  if (userProfile === null) {
    return (
      <div className={PAGE}>
        <Notice title={`No pet called ${profileName} here`} />
      </div>
    );
  }

  const followList = toShow === "follower" ? "follower" : "following";

  return (
    <div className={PAGE}>
      <section className="flex items-center gap-5 md:gap-10">
        {!userProfile ? (
          <Skeleton circle width={80} height={80} />
        ) : isOwnProfile ? (
          <label
            title="Change profile picture"
            className={`relative shrink-0 cursor-pointer rounded-pill has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-primary ${busy ? "opacity-50" : ""}`}
          >
            <Avatar
              src={userProfile.profilePic}
              className={`block ${AVATAR}`}
            />
            <span className="absolute right-0 bottom-0 flex rounded-pill bg-primary p-1 text-on-primary">
              <IoCameraOutline className="size-4" />
            </span>
            <input
              type="file"
              aria-label="Change profile picture"
              accept="image/*"
              disabled={busy}
              onChange={(e) => onPicChosen(e.target.files?.[0])}
              className="sr-only"
            />
          </label>
        ) : (
          <Avatar
            src={userProfile.profilePic}
            className={`shrink-0 ${AVATAR}`}
          />
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <h2 className="min-w-0 truncate text-2xl font-extrabold md:text-3xl">
              {userProfile?.username ?? <Skeleton width={160} />}
            </h2>
            {profile && userProfile && !isOwnProfile && (
              <Button
                size="sm"
                variant={isFollowing ? "secondary" : "primary"}
                disabled={busy}
                onClick={onFollowClick}
              >
                {isFollowing ? "Unfollow" : "Follow"}
              </Button>
            )}
          </div>
          <div className="flex gap-4 md:gap-6">
            <Stat
              label={userPosts?.length === 1 ? "post" : "posts"}
              count={userPosts?.length}
              active={toShow === "posts"}
              onClick={() => setToShow("posts")}
            />
            <Stat
              label={
                userProfile?.follower.length === 1 ? "follower" : "followers"
              }
              count={userProfile?.follower.length}
              active={toShow === "follower"}
              onClick={() => setToShow("follower")}
            />
            <Stat
              label="following"
              count={userProfile?.following.length}
              active={toShow === "following"}
              onClick={() => setToShow("following")}
            />
          </div>
        </div>
      </section>
      {toShow === "posts" && userPosts?.length === 0 && (
        <Notice title="No posts yet" />
      )}
      {toShow === "posts" && !!userPosts?.length && (
        <div className="grid grid-cols-3 gap-1 md:gap-2">
          {userPosts.map((post) => (
            <Link to={`/post/${post.id}`} key={post.id}>
              <PostImage
                post={post}
                className="block aspect-square w-full rounded-control object-cover"
              />
            </Link>
          ))}
        </div>
      )}
      {toShow !== "posts" &&
        userProfile &&
        (userProfile[followList].length > 0 ? (
          <div className="rounded-card border border-line bg-surface p-2">
            <UserCards usernames={userProfile[followList]} />
          </div>
        ) : (
          <Notice
            title={
              toShow === "follower"
                ? "No followers yet"
                : "Not following anyone yet"
            }
          />
        ))}
    </div>
  );
}
