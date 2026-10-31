import { useId, type InputHTMLAttributes, type Ref } from "react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  // shown under the field; omit when there's nothing to report
  error?: string;
  ref?: Ref<HTMLInputElement>;
}

export function TextField({ label, error, className = "", ...props }: Props) {
  const errorId = useId();
  return (
    <div className={`flex w-full flex-col gap-1 ${className}`}>
      <label className="flex flex-col gap-1">
        <span className="text-sm font-semibold text-muted">{label}</span>
        <input
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className="box-border w-full rounded-control border border-line bg-surface px-3 py-2 text-ink outline-none transition-colors focus:border-primary aria-invalid:border-danger"
          {...props}
        />
      </label>
      {error && (
        <span id={errorId} role="alert" className="text-xs text-danger">
          {error}
        </span>
      )}
    </div>
  );
}
