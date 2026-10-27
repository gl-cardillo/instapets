import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase/config";
import { useAuth } from "../../auth/AuthContext";
import { createUserProfile, isUsernameTaken } from "../../services/users";

interface SignInForm {
  email: string;
  name: string;
  password: string;
}

export function SignIn() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInForm>();
  const navigate = useNavigate();
  const { refreshProfile, refreshUsers } = useAuth();
  const [error, setError] = useState("");

  const registerUser = async (data: SignInForm) => {
    try {
      if (await isUsernameTaken(data.name)) {
        setError("username already used");
        return;
      }
      await createUserWithEmailAndPassword(auth, data.email, data.password);
      await createUserProfile(data.email, data.name);
      // the auth listener fires before the profile doc exists
      await Promise.all([refreshProfile(), refreshUsers()]);
      navigate("/home");
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error));
    }
  };

  return (
    <div className="starting-page">
      <div className="login-signIn-container">
        <h1 className="title"> Instapets</h1>
        <p className="sign-up-text">Sign up to see photos of beautiful pets</p>
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
                  // usernames are document ids, which can't contain "/"
                  pattern: /^[^/]+$/,
                })}
              />
            </label>
          </div>
          <p className="error">
            {errors.name &&
              "Name must be between two and fifteen characters, without /"}
          </p>
          <span className="error">{error}</span>
          <div className="label-container">
            <label>
              <span className="label"> Password:</span>
              <input
                type="password"
                id="password"
                {...register("password", {
                  required: true,
                  pattern: {
                    value: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#%&*]{8,}$/,
                    message:
                      "The password must be minimum eight characters, at least one letter, one number, and may include !@#%&*",
                  },
                })}
              />
            </label>
          </div>
          <p className="error">{errors.password && errors.password.message}</p>
          <button disabled={isSubmitting} className="signIn-button">
            {isSubmitting ? "Loading..." : "Register"}
          </button>
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
