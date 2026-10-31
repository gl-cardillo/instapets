import type { ButtonHTMLAttributes } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  // icons have no text, so screen readers need this to name the button
  label: string;
}

export function IconButton({ label, className = "", ...props }: Props) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`inline-flex cursor-pointer items-center justify-center rounded-pill border-0 bg-transparent text-ink transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${className}`}
      {...props}
    />
  );
}
