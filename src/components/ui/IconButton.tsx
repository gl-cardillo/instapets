import type { ButtonHTMLAttributes } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  // names the button for screen readers
  label: string;
}

export function IconButton({ label, className = "", ...props }: Props) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`inline-flex cursor-pointer items-center justify-center rounded-pill text-ink transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${className}`}
      {...props}
    />
  );
}
