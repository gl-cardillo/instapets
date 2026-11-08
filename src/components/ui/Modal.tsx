import { useEffect, useRef, useState, type ReactNode } from "react";
import { BsX } from "react-icons/bs";
import { IconButton } from "./IconButton";

interface Props {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Modal({ title, onClose, children }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  // read before autoFocus moves focus to the close button
  const [opener] = useState(() => document.activeElement as HTMLElement | null);

  // focus goes back to whatever opened the modal
  useEffect(() => () => opener?.focus(), [opener]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab" || !dialogRef.current) return;
      // keeps tab inside the modal
      const items = [
        ...dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
      ];
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="flex max-h-[70dvh] w-full max-w-sm flex-col rounded-card bg-surface shadow-card"
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <h2 className="text-base font-semibold">{title}</h2>
          <IconButton label="Close" onClick={onClose} autoFocus>
            <BsX className="size-6" />
          </IconButton>
        </div>
        <div className="overflow-y-auto p-2">{children}</div>
      </div>
    </div>
  );
}
