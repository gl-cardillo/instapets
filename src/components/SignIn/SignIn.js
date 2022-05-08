import { useState } from "react";
import { useForm } from "react-hook-form";
import { auth, db } from "../../firebase/config";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import {
  collection,
  getDocs,
  where,
  setDoc,
  doc,
  query,
} from "firebase/firestore";

export function SignIn() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  let navigate = useNavigate();
  const [error, setError] = useState("");

  const registerUser = async (data) => {
    try {
      let response = [];
      const q = query(
        collection(db, "users"),
        where("username", "==", `${data.name}`)
      );
      const snapshot = await getDocs(q);
      snapshot.forEach((doc) => response.push(doc.data()));
      if (response.length > 0) {
        setError("username already used");
        return;
      }
      await createUserWithEmailAndPassword(auth, data.email, data.password);
      await setDoc(doc(db, "users", data.name), {
        email: data.email,
        username: data.name,
        follower: [],
        following: [],
        likes: [],
        comments: [],
        profilePic:
          "https://firebasestorage.googleapis.com/v0/b/instapets-a12eb.appspot.com/o/profilePic%2Fdefault-profile-pic.png?alt=media&token=ae7f8cab-fa03-44d2-89a1-104c290c0ca0",
      });

      navigate("/home");
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="starting-page">
      <div className="login-signIn-container">
        <h1 className="title"> Instapets</h1>
        <p className="sign-up-text">Sign up to see photos of beautifull pets</p>
        <form onSubmit={handleSubmit(registerUser)}>
          <div className="label-container">
            <label>
              <span className="label"> Email:</span>
              <input
                type="email"
                id="email"
                {...register("email", {
                  required: true,
                  minLength: 9,
                  maxLength: 35,
                })}
              />
            </label>
          </div>
          <p className="error"> {errors.email && "Email is required"}</p>
          <div className="label-container">
            <label>
              <span className="label"> Pet username:</span>
              <input
                type="text"
                id="name"
                {...register("name", {
                  required: true,
                  minLength: 2,
                  maxLength: 15,
                })}
              />
            </label>
          </div>
          <p className="error">
            {errors.name && "Name must between two and fifteen characters"}
          </p>
          <span className="error">{error}</span>
          <div className="label-container">
            <label>
              <span className="label"> Password:</span>
              <input
                type="password"
                id="passowrd"
                {...register("password", {
                  required: true,
                  pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
                })}
              />
            </label>
          </div>
          <p className="error">
            {errors.password &&
              "The password must be minimum eight characters, at least one letter and one number"}
          </p>
          <button className="signIn-button">Register</button>
        </form>
        <p>
          Have an account?
          <Link
            to="/login"
            style={{
              textDecoration: "none",
              color: "#0095f6",
              fontWeight: "600",
            }}
          >
            &nbsp;Log in
          </Link>
        </p>
      </div>
    </div>
  );
}