import { useCallback } from "react";
import { getUser, getUsers } from "../services/users";
import { useLoader } from "./useLoader";

// undefined while loading, null if there's no such user
export function useUser(username: string) {
  return useLoader(useCallback(() => getUser(username), [username])).data;
}

// the existing ones among `usernames`; undefined while loading
export function useUsers(usernames: string[]) {
  // depend on the names, not the array, which is often a new one each render
  const key = usernames.join("\n");
  return useLoader(
    useCallback(() => getUsers(key ? key.split("\n") : []), [key]),
  ).data;
}
