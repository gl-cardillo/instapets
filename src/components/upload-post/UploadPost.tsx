import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { IoImageOutline } from "react-icons/io5";
import { useAuth, useCanWrite } from "../../auth/AuthContext";
import { MAX_CAPTION_LENGTH } from "../../limits";
import { addPost } from "../../services/posts";
import { handleError, reportError } from "../../utils/alerts";
import { Avatar } from "../Avatar/Avatar";
import { Button } from "../ui/Button";

export function UploadPost() {
  const { profile } = useAuth();
  const canWrite = useCanWrite();
  const navigate = useNavigate();
  const [pic, setPic] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [posting, setPosting] = useState(false);

  // free the previous preview's memory
  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );

  // RequireAuth only renders this page for signed-in users
  if (!profile) return null;

  const onPicChosen = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      handleError("Please choose an image");
      return;
    }
    setPic(file);
    setPreview(URL.createObjectURL(file));
  };

  const submitPost = async () => {
    const me = canWrite();
    if (!me || !pic) return;
    setPosting(true);
    try {
      await addPost(pic, me, caption);
      navigate(`/profile/${profile.username}`);
    } catch (error) {
      reportError(error);
      setPosting(false);
    }
  };

  return (
    <div className="mx-auto box-border w-full max-w-md p-4">
      <div className="flex flex-col overflow-hidden rounded-card border border-line bg-surface shadow-card">
        <div className="flex items-center gap-3 p-3">
          <Avatar src={profile.profilePic} alt="profile" />
          <span className="truncate font-bold">{profile.username}</span>
        </div>
        <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 bg-surface-hover text-muted hover:text-primary has-focus-visible:outline-2 has-focus-visible:-outline-offset-2 has-focus-visible:outline-primary">
          {preview ? (
            <img
              src={preview}
              alt="preview of your post"
              className="size-full object-contain"
            />
          ) : (
            <>
              <IoImageOutline className="size-12" />
              <span className="text-sm font-bold">Choose a picture</span>
            </>
          )}
          <input
            type="file"
            aria-label="Choose a picture"
            accept="image/*"
            onChange={(e) => onPicChosen(e.target.files?.[0])}
            className="sr-only"
          />
        </label>
        <textarea
          aria-label="Caption"
          rows={3}
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Write a caption..."
          maxLength={MAX_CAPTION_LENGTH}
          className="box-border w-full border-0 p-3 text-sm outline-none"
        />
        <div className="flex justify-end gap-2 border-t border-line p-3">
          <Button variant="secondary" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button onClick={submitPost} disabled={posting || !pic}>
            {posting ? "Posting..." : "Post"}
          </Button>
        </div>
      </div>
    </div>
  );
}
