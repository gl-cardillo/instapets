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

// a post's picture, or a placeholder for old Storage ones
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
      alt={post.caption || `Picture posted by ${post.user}`}
      className={`bg-surface-hover ${className ?? ""}`}
      onDoubleClick={onDoubleClick}
      onError={() => setFailed(true)}
    />
  );
}
