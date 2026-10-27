import "./Card.css";
import { Link } from "react-router-dom";
import type { UserProfile } from "../../types";
import { Avatar } from "../Avatar/Avatar";

export function Card({ user }: { user: UserProfile }) {
  return (
    <Link to={`/profile/${user.username}`}>
      <div className="card-user">
        <Avatar src={user.profilePic} />{" "}
        <p>{user.username}</p>
      </div>
    </Link>
  );
}
