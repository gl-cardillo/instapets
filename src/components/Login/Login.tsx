import "./Login-signIn.css";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase/config";
import logo from "../../img/logo-insta.png";
import { Button } from "../ui/Button";
import { TextField } from "../ui/TextField";

interface LoginForm {
  email: string;
  password: string;
}

export function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>();

  const loginUser = async (data: LoginForm) => {
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      navigate("/home");
    } catch (error) {
      console.error(error);
      setError("Email or password incorrect");
    }
  };

  return (
    <div className="starting-page">
      <div className="login-signIn-container">
        <img src={logo} alt="logo" />
        <h1 className="title">Instapets</h1>
        <form
          onSubmit={handleSubmit(loginUser)}
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
            {...register("email", { required: true })}
          />
          <TextField
            label="Password"
            type="password"
            autoComplete="current-password"
            error={errors.password && "Password is required"}
            {...register("password", { required: true })}
          />
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Loading..." : "Log in"}
          </Button>
        </form>
        <p className="text-sm">
          Don't have an account?{" "}
          <Link to="/signIn" className="font-bold text-primary">
            Sign up
          </Link>
        </p>
        <p className="text-sm">
          Or continue as a{" "}
          <Link to="/home" className="font-bold text-primary">
            guest
          </Link>
        </p>
      </div>
    </div>
  );
}
