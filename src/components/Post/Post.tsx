import { useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router";
import { BsX } from "react-icons/bs";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useAuth } from "../../auth/AuthContext";
import { useLoader } from "../../hooks/useLoader";
import { deletePost, getPost } from "../../services/posts";
import { confirmDelete, handleSuccess, reportError } from "../../utils/alerts";
import { UserAvatar } from "../Avatar/Avatar";
import { LikeAndComment } from "../LikesAndComments/LikesAndComments";
import { LikeableImage } from "../PostImage/LikeableImage";
import { IconButton } from "../ui/IconButton";
import { Notice } from "../ui/Notice";

const PAGE = "mx-auto w-full max-w-5xl p-4";

export function Post() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { postId = "" } = useParams();
  // undefined while loading, null if it doesn't exist
  const { data: post, setData: setPost } = useLoader(
    useCallback(() => getPost(postId), [postId]),
  );

  const confirmDeletePost = async () => {
    if (!post) return;
    if (!(await confirmDelete("Are you sure you want to delete this post?")))
      return;
    try {
      await deletePost(post.id);
      navigate(-1);
      handleSuccess("post deleted");
    } catch (error) {
      reportError(error);
    }
  };

  if (post === null) {
    return (
      <div className={PAGE}>
        <Notice title="This post doesn't exist anymore" />
      </div>
    );
  }

  if (post === undefined) {
    return (
      <div className={PAGE}>
        <Skeleton height={400} />
      </div>
    );
  }

  return (
    <div className={PAGE}>
      <h2 className="sr-only">Post by {post.user}</h2>
      {/* header on top on phones, beside the picture on desktop */}
      <article className="grid overflow-hidden rounded-card border border-line bg-surface shadow-card lg:max-h-[85dvh] lg:grid-cols-[3fr_2fr] lg:grid-rows-[auto_1fr]">
        <div className="flex items-center justify-between gap-3 border-line p-3 lg:col-start-2 lg:border-b">
          <Link
            to={`/profile/${post.user}`}
            className="flex min-w-0 items-center gap-3"
          >
            <UserAvatar username={post.user} fallback={post.userPic} />
            <span className="truncate font-semibold">{post.user}</span>
          </Link>
          {post.user === profile?.username && (
            <IconButton label="Delete post" onClick={confirmDeletePost}>
              <BsX className="size-6" />
            </IconButton>
          )}
        </div>
        <LikeableImage
          post={post}
          onPostChange={setPost}
          className="lg:col-start-1 lg:row-span-2 lg:row-start-1"
          imageClassName="block h-full max-h-[85dvh] w-full object-contain"
        />
        <div className="min-h-0 overflow-y-auto lg:col-start-2">
          <LikeAndComment post={post} onPostChange={setPost} />
        </div>
      </article>
    </div>
  );
}
