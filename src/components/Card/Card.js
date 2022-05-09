import "./Card.css"
import { Link } from "react-router-dom"

export function Card ({user}) {
  return (
    <Link to={`/profile/${user.username}`}>
      <div className="card-user">
        <img src={user.profilePic} alt="avatar" className="avatar" />{" "}
        <p>{user.username}</p>
      </div>
    </Link>
  )
}