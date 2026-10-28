import "./UploadPost.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, useCanWrite } from "../../auth/AuthContext";
import { addPost } from "../../services/posts";
import { handleError, reportError } from "../../utils/alerts";
import addPicPlaceholder from "../../img/add-pic.png";
import { Avatar } from "../Avatar/Avatar";

export function UploadPost() {
  const { profile } = useAuth();
  const canWrite = useCanWrite();
  const navigate = useNavigate();
  const [pic, setPic] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [posting, setPosting] = useState(false);

  // free the previous preview's memory when it changes or on leaving
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
    if (!pic) {
      handleError("Choose a picture first");
      return;
    }
    const me = canWrite();
    if (!me) return;
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
    <div className="main-page">
      <div className="upload-post-section">
        <div className="profile-pic-upload-post">
          <Avatar src={profile.profilePic} alt="profile" />
          <h3>{profile.username}</h3>
        </div>
        <div className="pic-upload-post">
          <label htmlFor="file-input">
            {preview ? (
              <img src={preview} alt="profile" className="add-pic" />
            ) : (
              <img
                src={addPicPlaceholder}
                className="add-pic-placeholder"
                alt="add"
              />
            )}
          </label>
          <input
            type="file"
            id="file-input"
            accept="image/*"
            onChange={(e) => onPicChosen(e.target.files?.[0])}
          />
        </div>
        <textarea
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Write a caption..."
        />
        <div className="buttons-post">
          <button className="button" onClick={() => navigate(-1)}>
            Cancel
          </button>
          <button className="button" onClick={submitPost} disabled={posting}>
            {posting ? "Posting..." : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
}
