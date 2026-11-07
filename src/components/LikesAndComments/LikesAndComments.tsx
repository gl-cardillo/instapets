import {
  useCallback,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { Link } from "react-router";
import {
  BsChat,
  BsPencil,
  BsShare,
  BsSuitHeart,
  BsSuitHeartFill,
  BsX,
} from "react-icons/bs";
import { useAuth, useCanWrite } from "../../auth/AuthContext";
import { useLikeToggle } from "../../hooks/useLikeToggle";
import { useLoader } from "../../hooks/useLoader";
import {
  addComment,
  deleteComment,
  getComments,
} from "../../services/comments";
import { MAX_CAPTION_LENGTH, MAX_COMMENT_LENGTH } from "../../limits";
import { updateCaption } from "../../services/posts";
import type { Post } from "../../types";
import {
  confirmDelete,
  handleError,
  handleSuccess,
  reportError,
} from "../../utils/alerts";
import { sharePost } from "../../utils/share";
import { getTime } from "../../utils/time";
import { Avatar, UserAvatar } from "../Avatar/Avatar";
import { UserCards } from "../Card/UserCards";
import { Button } from "../ui/Button";
import { IconButton } from "../ui/IconButton";
import { Modal } from "../ui/Modal";
import { TextEditor } from "../ui/TextEditor";

interface Props {
  post: Post;
  onPostChange: (post: Post) => void;
}

const TEXT_BUTTON = "cursor-pointer hover:text-primary";

export function LikeAndComment({ post, onPostChange }: Props) {
  const { profile } = useAuth();
  const canWrite = useCanWrite();
  const toggleLike = useLikeToggle(onPostChange);
  const { data: comments = [], reload: loadComments } = useLoader(
    useCallback(() => getComments(post.id), [post.id]),
  );
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [showAddComments, setShowAddComments] = useState(false);
  const [showLikes, setShowLikes] = useState(false);
  const [editingCaption, setEditingCaption] = useState(false);
  const closeLikes = useCallback(() => setShowLikes(false), []);

  const toggleAddComments = () => {
    if (canWrite()) setShowAddComments(!showAddComments);
  };

  const submitComment = async (e?: FormEvent) => {
    e?.preventDefault();
    if (commentText.trim() === "") return;
    const me = canWrite();
    if (!me) return;
    try {
      await addComment(post.id, commentText, me);
      setCommentText("");
      setShowComments(true);
      await loadComments();
    } catch (error) {
      reportError(error);
    }
  };

  // enter sends, shift+enter adds a line
  const onCommentKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submitComment();
    }
  };

  const removeComment = async (commentId: string) => {
    if (!profile) return;
    if (!(await confirmDelete("Delete this comment?"))) return;
    try {
      await deleteComment(commentId, profile.username);
      await loadComments();
    } catch (error) {
      reportError(error);
    }
  };

  const saveCaption = async (caption: string) => {
    if (!canWrite()) return;
    await updateCaption(post.id, caption);
    onPostChange({ ...post, caption });
    setEditingCaption(false);
  };

  const share = async () => {
    try {
      if ((await sharePost(post)) === "copied") handleSuccess("Link copied");
    } catch {
      handleError("Couldn't share this post. Try copying the address bar.");
    }
  };

  const isAuthor = profile?.username === post.user;
  const liked = profile !== null && post.likes.includes(profile.username);
  const othersWhoLiked = post.likes.length - 1;

  return (
    <div>
      <div className="flex flex-col gap-2 p-3">
        <div className="flex gap-4">
          <IconButton
            label={liked ? "Unlike" : "Like"}
            aria-pressed={liked}
            onClick={() => toggleLike(post)}
          >
            {liked ? (
              <BsSuitHeartFill className="size-6 text-like" />
            ) : (
              <BsSuitHeart className="size-6" />
            )}
          </IconButton>
          <IconButton label="Comment" onClick={toggleAddComments}>
            <BsChat className="size-6" />
          </IconButton>
          <IconButton label="Share" onClick={share}>
            <BsShare className="size-5" />
          </IconButton>
          {isAuthor && (
            <IconButton
              label="Edit caption"
              onClick={() => {
                if (canWrite()) setEditingCaption(true);
              }}
              className="ml-auto"
            >
              <BsPencil className="size-5" />
            </IconButton>
          )}
        </div>
        {post.likes.length > 0 && (
          <p className="text-sm">
            Liked by{" "}
            <Link to={`/profile/${post.likes[0]}`} className="font-bold">
              {post.likes[0]}
            </Link>
            {othersWhoLiked > 0 && (
              <>
                {" and "}
                <button
                  type="button"
                  onClick={() => setShowLikes(true)}
                  className={`${TEXT_BUTTON} font-bold`}
                >
                  {othersWhoLiked} other{othersWhoLiked > 1 ? "s" : ""}
                </button>
              </>
            )}
          </p>
        )}
        {showLikes && (
          <Modal title="Liked by" onClose={closeLikes}>
            <UserCards usernames={post.likes} />
          </Modal>
        )}
        {editingCaption && (
          <TextEditor
            label="Caption"
            initial={post.caption}
            maxLength={MAX_CAPTION_LENGTH}
            placeholder="Write a caption..."
            onSave={saveCaption}
            onCancel={() => setEditingCaption(false)}
          />
        )}
        {post.caption && !editingCaption && (
          <p className="text-sm wrap-break-word whitespace-pre-wrap">
            <Link to={`/profile/${post.user}`} className="font-bold">
              {post.user}
            </Link>{" "}
            {post.caption}
          </p>
        )}
        <p className="text-xs text-muted">{getTime(post.created)}</p>
        {comments.length > 0 && (
          <button
            type="button"
            aria-expanded={showComments}
            onClick={() => setShowComments(!showComments)}
            className={`${TEXT_BUTTON} self-start text-sm text-muted`}
          >
            {showComments
              ? "Hide comments"
              : `View ${comments.length} comment${comments.length > 1 ? "s" : ""}`}
          </button>
        )}
        {showComments && comments.length > 0 && (
          <ul className="flex max-h-72 flex-col gap-3 overflow-y-auto">
            {comments.map((comment) => (
              <li key={comment.commentId} className="flex items-start gap-2">
                <Link to={`/profile/${comment.username}`} className="flex">
                  <UserAvatar
                    username={comment.username}
                    fallback={comment.userPic}
                    className="size-8"
                  />
                </Link>
                <div className="min-w-0 flex-1">
                  <p className="text-sm wrap-break-word whitespace-pre-wrap">
                    <Link
                      to={`/profile/${comment.username}`}
                      className="font-bold"
                    >
                      {comment.username}
                    </Link>{" "}
                    {comment.text}
                  </p>
                  <p className="text-xs text-muted">
                    {getTime(comment.created)}
                  </p>
                </div>
                {comment.username === profile?.username && (
                  <IconButton
                    label="Delete comment"
                    onClick={() => removeComment(comment.commentId)}
                  >
                    <BsX className="size-5" />
                  </IconButton>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      {showAddComments && profile && (
        <form
          onSubmit={submitComment}
          className="flex items-center gap-2 border-t border-line p-3"
        >
          <Avatar src={profile.profilePic} className="size-8 shrink-0" />
          <textarea
            aria-label="Write a comment"
            rows={1}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={onCommentKeyDown}
            placeholder="Write a comment..."
            maxLength={MAX_COMMENT_LENGTH}
            className="min-w-0 flex-1 rounded-control border border-line bg-page px-3 py-2 text-sm outline-none transition-colors focus:border-primary"
          />
          <Button type="submit" size="sm" disabled={!commentText.trim()}>
            Add
          </Button>
        </form>
      )}
    </div>
  );
}
