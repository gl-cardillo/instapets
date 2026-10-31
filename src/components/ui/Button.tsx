import type { ButtonHTMLAttributes } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md";
}

const VARIANTS = {
  primary: "border-0 bg-primary text-on-primary hover:bg-primary-hover",
  secondary: "border border-line bg-surface text-ink hover:bg-surface-hover",
  ghost: "border-0 bg-transparent text-ink hover:bg-surface-hover",
};

const SIZES = {
  sm: "px-3 py-1 text-sm",
  md: "px-4 py-2",
};

export function Button({
  variant = "primary",
  size = "md",
  type = "button",
  className = "",
  ...props
}: Props) {
  return (
    <button
      type={type}
      className={`cursor-pointer rounded-control font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    />
  );
}
