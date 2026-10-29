import { useCallback } from "react";
import { useSearchParams } from "react-router";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useLoader } from "../../hooks/useLoader";
import { searchUsers } from "../../services/users";
import { Card } from "../Card/Card";

export function SearchPage() {
  const [params] = useSearchParams();
  const search = params.get("q") ?? "";
  const { data: searchResult } = useLoader(
    useCallback(() => searchUsers(search, 50), [search]),
  );

  return (
    <div className="search-section">
      <h4>Users found: </h4>
      {searchResult ? (
        searchResult.map((user) => <Card user={user} key={user.username} />)
      ) : (
        <Skeleton count={3} />
      )}
    </div>
  );
}
