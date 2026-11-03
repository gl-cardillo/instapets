import { useEffect, useState } from "react";
import { searchUsers } from "../services/users";
import type { UserProfile } from "../types";

// debounced prefix search; keeps old results while loading
export function useUserSearch(text: string, max: number) {
  const query = text.trim();
  const [found, setFound] = useState<{ query: string; users: UserProfile[] }>();

  useEffect(() => {
    if (!query) return;
    let current = true;
    const timer = setTimeout(() => {
      searchUsers(query, max)
        .then((users) => {
          if (current) setFound({ query, users });
        })
        .catch(console.error);
    }, 300);
    return () => {
      current = false;
      clearTimeout(timer);
    };
  }, [query, max]);

  if (!query) return { users: [], loading: false };
  return { users: found?.users ?? [], loading: found?.query !== query };
}
