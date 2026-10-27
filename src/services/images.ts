import { doc, getDoc } from "firebase/firestore";
import { imagesCol } from "./collections";

// pictures don't change, so each is read at most once per visit
const cache = new Map<string, Promise<string | null>>();

// a post's picture as a data URL, or null if it has none
export function getPostImage(postId: string): Promise<string | null> {
  let image = cache.get(postId);
  if (!image) {
    image = getDoc(doc(imagesCol, postId)).then((snapshot) =>
      snapshot.exists() ? snapshot.data().src : null,
    );
    // don't cache failures, so they're retried
    image.catch(() => cache.delete(postId));
    cache.set(postId, image);
  }
  return image;
}

export function forgetPostImage(postId: string): void {
  cache.delete(postId);
}
