import { createContext, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
import type { User } from "firebase/auth";
import type { UserProfile } from "../types";
import { handleError } from "../utils/alerts";

export interface AuthState {
  authUser: User | null;
  // null for guests, and until the first auth check finishes
  profile: UserProfile | null;
  // true until the first auth check finishes
  loading: boolean;
  // every user, for search, avatars and follower lists
  users: UserProfile[];
  // posting, liking, commenting and following need a verified email
  emailVerified: boolean;
  refreshProfile: () => Promise<void>;
  refreshUsers: () => Promise<void>;
  // re-checks after the user clicks the link in the verification email
  refreshEmailVerified: () => Promise<boolean>;
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

// Returns a check to run before writing anything. It returns the signed-in
// profile, or null after sending guests to the login page or telling
// unverified users to verify their email first.
export function useCanWrite() {
  const { profile, emailVerified } = useAuth();
  const navigate = useNavigate();
  return useCallback((): UserProfile | null => {
    if (!profile) {
      navigate("/login");
      return null;
    }
    if (!emailVerified) {
      handleError(
        "Please verify your email first: click the link we sent you, then press \"I've verified\".",
      );
      return null;
    }
    return profile;
  }, [profile, emailVerified, navigate]);
}
