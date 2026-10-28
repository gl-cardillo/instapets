import { useCanWrite } from "../auth/AuthContext";
import { toggleLike } from "../services/posts";
import type { Post } from "../types";
import { reportError } from "../utils/alerts";

// returns a like/unlike handler
export function useLikeToggle(onPostChange: (post: Post) => void) {
  const canWrite = useCanWrite();

  return async (post: Post) => {
    const me = canWrite();
    if (!me) return;
    try {
      onPostChange(await toggleLike(post, me.username));
    } catch (error) {
      reportError(error);
    }
  };
}
