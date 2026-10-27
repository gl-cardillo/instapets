import { createContext, useCallback, useContext } from "react";
import type { User } from "firebase/auth";
import type { UserProfile } from "../types";

export interface AuthState {
  authUser: User | null;
  // null for guests, and until the first auth check finishes
  profile: UserProfile | null;
  // true until the first auth check finishes
  loading: boolean;
  // every user, for search, avatars and follower lists
  users: UserProfile[];
  refreshProfile: () => Promise<void>;
  refreshUsers: () => Promise<void>;
}

export const AuthContext = createContext<AuthState | null>(null);

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>");
  return context;
}

// a user's current picture, falling back to the copy stored on older posts
// and comments; "" means the default (see <Avatar>)
export function useProfilePic() {
  const { users } = useAuth();
  return useCallback(
    (username: string, fallback = "") =>
      users.find((user) => user.username === username)?.profilePic || fallback,
    [users],
  );
}
