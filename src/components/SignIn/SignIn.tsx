import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { auth } from "../../firebase/config";
import { useAuth } from "../../auth/AuthContext";
import { createUserProfile, isUsernameTaken } from "../../services/users";
import { Button } from "../ui/Button";
import { TextField } from "../ui/TextField";

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
  const { refreshProfile } = useAuth();
  const [error, setError] = useState("");

  const registerUser = async (data: SignInForm) => {
    try {
      if (await isUsernameTaken(data.name)) {
        setError("username already used");
        return;
      }
      const { user } = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password,
      );
      await createUserProfile(data.email, data.name);
      // the auth listener fires before the profile doc exists
      await refreshProfile();
      try {
        await sendEmailVerification(user);
      } catch (error) {
        // the banner on every page offers to resend it
        console.error(error);
      }
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
        <form
          onSubmit={handleSubmit(registerUser)}
          className="flex w-full flex-col gap-3"
        >
          {error && (
            <p role="alert" className="text-sm text-danger">
              {error}
            </p>
          )}
          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            error={errors.email && "Email is required"}
            {...register("email", {
              required: true,
              minLength: 9,
              maxLength: 35,
            })}
          />
          <TextField
            label="Pet username"
            type="text"
            autoComplete="username"
            error={
              errors.name &&
              "Name must be between two and fifteen characters, without /"
            }
            {...register("name", {
              required: true,
              minLength: 2,
              maxLength: 15,
              // usernames are document ids, which can't contain "/"
              pattern: /^[^/]+$/,
            })}
          />
          <TextField
            label="Password"
            type="password"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register("password", {
              required: "Password is required",
              pattern: {
                value: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#%&*]{8,}$/,
                message:
                  "The password must be minimum eight characters, at least one letter, one number, and may include !@#%&*",
              },
            })}
          />
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Loading..." : "Register"}
          </Button>
        </form>
        <p className="text-sm">
          Have an account?{" "}
          <Link to="/login" className="font-bold text-primary">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
