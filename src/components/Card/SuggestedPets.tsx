import { useCallback, useState } from "react";
import { useAuth, useCanWrite } from "../../auth/AuthContext";
import { useLoader } from "../../hooks/useLoader";
import { suggestPets, toggleFollow } from "../../services/users";
import { reportError } from "../../utils/alerts";
import { Button } from "../ui/Button";
import { Card } from "./Card";

// pets to follow, each with a follow button; nothing for guests
export function SuggestedPets() {
  const { profile, refreshProfile } = useAuth();
  const canWrite = useCanWrite();
  const [following, setFollowing] = useState<string | null>(null);
  // reload when who you follow changes, not on every new profile object
  const key = profile
    ? `${profile.username}\n${profile.following.join("\n")}`
    : "";

  const { data: suggestions } = useLoader(
    useCallback(() => {
      if (!key) return Promise.resolve([]);
      const [username, ...following] = key.split("\n");
      return suggestPets(username, following.filter(Boolean));
    }, [key]),
  );

  const follow = async (username: string) => {
    const me = canWrite();
    if (!me) return;
    setFollowing(username);
    try {
      await toggleFollow(username, me.username, false);
      await refreshProfile();
    } catch (error) {
      reportError(error);
    } finally {
      setFollowing(null);
    }
  };

  if (!profile || !suggestions?.length) return null;
  return (
    <section className="flex flex-col gap-1 rounded-card border border-line bg-surface p-2">
      <h2 className="px-2 pt-1 text-sm font-medium text-muted">
        Suggested for you
      </h2>
      {suggestions.map((user) => (
        <div
          key={user.username}
          className="flex items-center justify-between gap-2"
        >
          <div className="min-w-0 flex-1">
            <Card user={user} />
          </div>
          <Button
            size="sm"
            disabled={following !== null}
            onClick={() => follow(user.username)}
            aria-label={`Follow ${user.username}`}
          >
            Follow
          </Button>
        </div>
      ))}
    </section>
  );
}
