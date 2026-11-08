import type { ReactNode } from "react";

interface Props {
  title: string;
  children?: ReactNode;
}

// a card for empty and not found states
export function Notice({ title, children }: Props) {
  return (
    <div className="rounded-card border border-line bg-surface p-8 text-center">
      <p className="font-semibold">{title}</p>
      {children && <p className="mt-1 text-sm text-muted">{children}</p>}
    </div>
  );
}
