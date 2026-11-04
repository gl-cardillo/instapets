import { useEffect, useState } from "react";
import { BsSuitHeartFill } from "react-icons/bs";
import { useCanWrite } from "../../auth/AuthContext";
import { useLikeToggle } from "../../hooks/useLikeToggle";
import type { Post } from "../../types";
import { PostImage } from "./PostImage";

interface Props {
  post: Post;
  onPostChange: (post: Post) => void;
  // for the wrapper, e.g. grid placement
  className?: string;
  imageClassName?: string;
}

// a post's picture that double-tap likes, with a heart burst
export function LikeableImage({
  post,
  onPostChange,
  className = "",
  imageClassName,
}: Props) {
  const canWrite = useCanWrite();
  const toggleLike = useLikeToggle(onPostChange);
  // a new key restarts the animation on every double-tap
  const [burst, setBurst] = useState(0);

  // removes the heart when its 0.9s animation is over
  useEffect(() => {
    if (!burst) return;
    const timer = setTimeout(() => setBurst(0), 900);
    return () => clearTimeout(timer);
  }, [burst]);

  // only ever likes, like instagram; the button unlikes
  const like = () => {
    const me = canWrite();
    if (!me) return;
    setBurst((n) => n + 1);
    if (!post.likes.includes(me.username)) toggleLike(post);
  };

  return (
    <div className={`relative select-none ${className}`}>
      <PostImage post={post} className={imageClassName} onDoubleClick={like} />
      {burst > 0 && (
        <BsSuitHeartFill
          key={burst}
          data-testid="like-burst"
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 m-auto size-24 animate-heart-pop text-white drop-shadow-lg motion-reduce:animate-heart-fade"
        />
      )}
    </div>
  );
}
