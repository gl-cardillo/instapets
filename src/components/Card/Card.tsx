import { Link } from "react-router";
import type { UserProfile } from "../../types";
import { Avatar } from "../Avatar/Avatar";

export function Card({ user }: { user: UserProfile }) {
  return (
    <Link
      to={`/profile/${user.username}`}
      className="flex items-center gap-3 rounded-control p-2 hover:bg-surface-hover"
    >
      <Avatar src={user.profilePic} />
      <span className="truncate font-bold">{user.username}</span>
    </Link>
  );
}
