import type { Post } from "../types";

export function postUrl(postId: string): string {
  const { origin, pathname } = window.location;
  return `${origin}${pathname}#/post/${postId}`;
}

// the device share sheet where there is one, else copies the link
export async function sharePost(
  post: Post,
): Promise<"shared" | "copied" | "cancelled"> {
  const url = postUrl(post.id);
  if (navigator.share) {
    try {
      await navigator.share({ title: `${post.user} on Instapets`, url });
      return "shared";
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return "cancelled";
      }
      // some browsers refuse; fall back to copying
    }
  }
  await navigator.clipboard.writeText(url);
  return "copied";
}
