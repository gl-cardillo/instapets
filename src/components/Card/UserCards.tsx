import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useUsers } from "../../hooks/useUser";
import { Card } from "./Card";

// a card for each of the given users, loaded on demand
export function UserCards({ usernames }: { usernames: string[] }) {
  const users = useUsers(usernames);
  if (!users) return <Skeleton count={Math.min(usernames.length, 5)} />;
  return users.map((user) => <Card user={user} key={user.username} />);
}
