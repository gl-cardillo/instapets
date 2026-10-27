import { useCallback, useState } from "react";
import { useLoader } from "../../hooks/useLoader";
import { getPostImage } from "../../services/images";
import type { Post } from "../../types";
import loadingImage from "../../img/image-loading.svg";
import unavailableImage from "../../img/image-unavailable.svg";

interface Props {
  post: Post;
  className?: string;
  onDoubleClick?: () => void;
}

// A post's picture, loaded from Firestore. Older posts point at Firebase
// Storage, which no longer serves them, so they show a placeholder.
export function PostImage({ post, className, onDoubleClick }: Props) {
  // undefined while loading, null if there's no picture
  const { data: stored } = useLoader(
    useCallback(
      () =>
        post.urlPic
          ? Promise.resolve(null)
          : getPostImage(post.id).catch((error) => {
              console.error(error);
              return null;
            }),
      [post.id, post.urlPic],
    ),
  );
  const [failed, setFailed] = useState(false);

  let src: string;
  if (post.urlPic) src = failed ? unavailableImage : post.urlPic;
  else if (stored === undefined) src = loadingImage;
  else src = stored ?? unavailableImage;

  return (
    <img
      src={src}
      alt="post"
      className={className}
      onDoubleClick={onDoubleClick}
      onError={() => setFailed(true)}
    />
  );
}
