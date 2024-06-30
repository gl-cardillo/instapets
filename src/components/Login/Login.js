import "./Login-signIn.css";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase/config";

export function Login() {
  let navigate = useNavigate();
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    isSubmitting,
    formState: { errors },
  } = useForm();

  const loginUser = async (data) => {
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      navigate("/home");
    } catch (error) {
      console.log(error.message);
      setError("Email or password incorrect");
    }
  };

  return (
    <div className="starting-page">
      <div className="login-signIn-container">
        <img src={require("../../img/logo-insta.png")} alt="logo" />
        <h1 className="title">Instapets</h1>
        <form onSubmit={handleSubmit(loginUser)}>
          <p className="login-error">{error}</p>
          <div className="label-container">
            <label>
              <span className="label"> Email:</span>
              <input
                type="text"
                id="email"
                {...register("email", { required: true })}
              />
            </label>
          </div>
          <p className="error">{errors.email && "Email is required"}</p>
          <div className="label-container">
            <label>
              <span className="label"> Password:</span>
              <input
                type="password"
                id="password"
                {...register("password", { required: true })}
              />
            </label>
          </div>
          <p className="error">{errors.password && "Password is required"} </p>
          <button disabled={isSubmitting}>
            {isSubmitting ? "Loading" : "Log in"}
          </button>
        </form>
        <p>
          Don't have an account?
          <Link
            to="/signIn"
            style={{
              textDecoration: "none",
              color: "#0095f6",
              fontWeight: "400",
            }}
          >
            &nbsp;Sign up
          </Link>
        </p>
        <p>
          Or continue as a
          <Link
            to="/home"
            style={{
              textDecoration: "none",
              color: "#0095f6",
              fontWeight: "400",
            }}
          >
            &nbsp;guest&nbsp;
          </Link>
        </p>
      </div>
    </div>
  );
}
