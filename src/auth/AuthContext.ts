import { createContext, useCallback, useContext } from "react";
import { useNavigate } from "react-router";
import type { User } from "firebase/auth";
import type { UserProfile } from "../types";
import { handleError } from "../utils/alerts";

export interface AuthState {
  authUser: User | null;
  // null for guests and while loading
  profile: UserProfile | null;
  // true until the first auth check
  loading: boolean;
  // posting, liking, commenting and following need a verified email
  emailVerified: boolean;
  refreshProfile: () => Promise<void>;
  // re-checks after the email link is clicked
  refreshEmailVerified: () => Promise<boolean>;
}

export const AuthContext = createContext<AuthState | null>(null);

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>");
  return context;
}

// returns the profile, or null after redirecting guests or warning the unverified
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
        'Please verify your email first: click the link we sent you, then press "I\'ve verified".',
      );
      return null;
    }
    return profile;
  }, [profile, emailVerified, navigate]);
}
