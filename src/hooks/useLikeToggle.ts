import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { toggleLike } from "../services/posts";
import type { Post } from "../types";
import { reportError } from "../utils/alerts";

// returns a like/unlike handler; guests are sent to the login page
export function useLikeToggle(onPostChange: (post: Post) => void) {
  const { profile } = useAuth();
  const navigate = useNavigate();

  return async (post: Post) => {
    if (!profile) {
      navigate("/login");
      return;
    }
    try {
      onPostChange(await toggleLike(post, profile.username));
    } catch (error) {
      reportError(error);
    }
  };
}
