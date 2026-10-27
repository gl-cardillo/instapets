import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { Card } from "../Card/Card";

export function SearchPage() {
  const [params] = useSearchParams();
  const { users } = useAuth();
  const search = (params.get("q") ?? "").toLowerCase().trim();
  const searchResult = search
    ? users.filter((user) => user.username.toLowerCase().includes(search))
    : [];

  return (
    <div className="search-section">
      <h4>Users found: </h4>
      {searchResult.map((user) => (
        <Card user={user} key={user.username} />
      ))}
    </div>
  );
}
