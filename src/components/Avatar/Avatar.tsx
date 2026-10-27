import { useState } from "react";
import defaultAvatar from "../../img/default-avatar.svg";

interface Props {
  // "" for the default picture
  src: string;
  alt?: string;
  className?: string;
}

// A profile picture. Shows the default when there's none or it fails to
// load, as the Firebase Storage pictures of older users do.
export function Avatar({ src, alt = "avatar", className = "avatar" }: Props) {
  const [failedSrc, setFailedSrc] = useState<string>();
  return (
    <img
      src={src && src !== failedSrc ? src : defaultAvatar}
      alt={alt}
      className={className}
      onError={() => setFailedSrc(src)}
    />
  );
}
