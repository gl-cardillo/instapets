import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "../firebase/config";
import { forgetUser, getUserByEmail } from "../services/users";
import type { UserProfile } from "../types";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [emailVerified, setEmailVerified] = useState(false);
  // only the latest profile load is applied, so a slow load started at
  // sign-up (before the profile doc exists) can't overwrite a later one
  const latestLoad = useRef(0);

  const loadProfile = useCallback(async (user: User | null) => {
    const load = ++latestLoad.current;
    const loaded = user?.email ? await getUserByEmail(user.email) : null;
    if (load === latestLoad.current) setProfile(loaded);
    if (loaded) forgetUser(loaded.username);
  }, []);

  const refreshProfile = useCallback(
    () => loadProfile(auth.currentUser),
    [loadProfile],
  );

  const refreshEmailVerified = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) return false;
    await user.reload();
    // security rules read email_verified from the ID token, so get a new one
    await user.getIdToken(true);
    setEmailVerified(user.emailVerified);
    return user.emailVerified;
  }, []);

  useEffect(
    () =>
      onAuthStateChanged(auth, async (user) => {
        setAuthUser(user);
        setEmailVerified(user?.emailVerified ?? false);
        try {
          await loadProfile(user);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      }),
    [loadProfile],
  );

  return (
    <AuthContext.Provider
      value={{
        authUser,
        profile,
        loading,
        emailVerified,
        refreshProfile,
        refreshEmailVerified,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
