import "./UploadPost.css";
import { useContext, useState } from "react";
import { UserDataContext } from "../../dataContext/dataContext";
import { useNavigate } from "react-router-dom";
import { addPost, uploadPic } from "../../utils/utils";

export function UploadPost() {
  const { userData } = useContext(UserDataContext);
  const [pic, setPic] = useState(null);
  const [showPic, setShowPic] = useState(null);
  const [caption, setCaption] = useState("");

  let navigate = useNavigate();

  async function addPostTimeOut(pic, userData, caption) {
    addPost(pic, userData, caption);
    setTimeout(() => {
      navigate(`/profile/${userData.username}`);
    }, 1500);
  }

  return (
    <div className="main-page">
      <div className="upload-post-section">
        <div className="profile-pic-upload-post">
          <img src={userData.profilePic} alt="profile" />
          <h3>{userData.username}</h3>
        </div>
        <div className="pic-upload-post">
          <label htmlFor="file-input">
            {pic ? (
              <img src={showPic} alt="profile" className="add-pic" />
            ) : (
              <img
                src={require("../../img/add-pic.png")}
                className="add-pic"
                alt="add"
              />
            )}
          </label>
          <input
            type="file"
            id="file-input"
            onChange={(e) => uploadPic(e, setPic, setShowPic)}
          />
        </div>
        <textarea
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Write a caption..."
        />
        <div className="buttons-post">
          <button className="button">Cancel</button>
          <button
            className="button"
            onClick={() => addPostTimeOut(pic, userData, caption)}
          >
            Post
          </button>;
        </div>
      </div>
    </div>
  );
}
