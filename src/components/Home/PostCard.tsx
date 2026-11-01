import { Link } from "react-router";
import { BsX } from "react-icons/bs";
import { useAuth } from "../../auth/AuthContext";
import { useLikeToggle } from "../../hooks/useLikeToggle";
import type { Post } from "../../types";
import { UserAvatar } from "../Avatar/Avatar";
import { LikeAndComment } from "../LikesAndComments/LikesAndComments";
import { PostImage } from "../PostImage/PostImage";
import { IconButton } from "../ui/IconButton";

interface Props {
  post: Post;
  onPostChange: (post: Post) => void;
  onDelete: (postId: string) => void;
}

export function PostCard({ post, onPostChange, onDelete }: Props) {
  const { profile } = useAuth();
  const toggleLike = useLikeToggle(onPostChange);

  return (
    <article className="overflow-hidden rounded-card border border-line bg-surface shadow-card">
      <div className="flex items-center justify-between gap-3 p-3">
        <Link
          to={`/profile/${post.user}`}
          className="flex min-w-0 items-center gap-3"
        >
          <UserAvatar
            username={post.user}
            fallback={post.userPic}
            className="avatar size-10"
          />
          <span className="truncate font-bold">{post.user}</span>
        </Link>
        {post.user === profile?.username && (
          <IconButton label="Delete post" onClick={() => onDelete(post.id)}>
            <BsX className="size-6" />
          </IconButton>
        )}
      </div>
      <PostImage
        post={post}
        className="block max-h-[80dvh] w-full bg-page object-contain"
        onDoubleClick={() => toggleLike(post)}
      />
      <LikeAndComment post={post} onPostChange={onPostChange} />
    </article>
  );
}
