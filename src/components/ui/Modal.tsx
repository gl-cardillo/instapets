import { useEffect, type ReactNode } from "react";
import { BsX } from "react-icons/bs";
import { IconButton } from "./IconButton";

interface Props {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export function Modal({ title, onClose, children }: Props) {
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-40 box-border flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="box-border flex max-h-[70dvh] w-full max-w-sm flex-col rounded-card bg-surface shadow-card"
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <h2 className="text-base font-bold">{title}</h2>
          <IconButton label="Close" onClick={onClose} autoFocus>
            <BsX className="size-6" />
          </IconButton>
        </div>
        <div className="overflow-y-auto p-2">{children}</div>
      </div>
    </div>
  );
}
