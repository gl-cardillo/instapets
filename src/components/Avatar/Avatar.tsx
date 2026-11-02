import { useState } from "react";
import { useUser } from "../../hooks/useUser";
import defaultAvatar from "../../img/default-avatar.svg";

interface Props {
  // "" for the default picture
  src: string;
  alt?: string;
  // sets the size
  className?: string;
}

// a profile picture, or the default if there's none or it fails to load
export function Avatar({ src, alt = "avatar", className = "size-10" }: Props) {
  const [failedSrc, setFailedSrc] = useState<string>();
  return (
    <img
      src={src && src !== failedSrc ? src : defaultAvatar}
      alt={alt}
      className={`rounded-pill bg-surface-hover object-cover ${className}`}
      onError={() => setFailedSrc(src)}
    />
  );
}

interface UserAvatarProps {
  username: string;
  // picture stored on older posts and comments
  fallback?: string;
  alt?: string;
  className?: string;
}

// a user's current profile picture
export function UserAvatar({
  username,
  fallback = "",
  alt,
  className,
}: UserAvatarProps) {
  const user = useUser(username);
  return (
    <Avatar
      src={user?.profilePic || fallback}
      alt={alt}
      className={className}
    />
  );
}
