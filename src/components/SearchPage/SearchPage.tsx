import { useSearchParams } from "react-router";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useUserSearch } from "../../hooks/useUserSearch";
import { Card } from "../Card/Card";
import { TextField } from "../ui/TextField";

export function SearchPage() {
  const [params, setParams] = useSearchParams();
  const search = params.get("q") ?? "";
  const { users, loading } = useUserSearch(search, 50);

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4 p-4">
      {/* the header's search box is hidden on phones */}
      <TextField
        label="Search pets"
        type="search"
        value={search}
        onChange={(e) => setParams({ q: e.target.value }, { replace: true })}
        className="md:hidden"
      />
      {search.trim() && (
        <h2 className="text-center text-lg font-bold">Users found</h2>
      )}
      {loading ? (
        <Skeleton count={3} />
      ) : (
        users.map((user) => <Card user={user} key={user.username} />)
      )}
    </div>
  );
}
