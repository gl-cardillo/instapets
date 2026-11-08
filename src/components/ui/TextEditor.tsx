import { useState, type FormEvent } from "react";
import { reportError } from "../../utils/alerts";
import { Button } from "./Button";

interface Props {
  label: string;
  initial: string;
  maxLength: number;
  placeholder?: string;
  // gets the trimmed text
  onSave: (text: string) => Promise<void>;
  onCancel: () => void;
}

// a text box with a counter and save/cancel, for bios and captions
export function TextEditor({
  label,
  initial,
  maxLength,
  placeholder,
  onSave,
  onCancel,
}: Props) {
  const [text, setText] = useState(initial);
  const [saving, setSaving] = useState(false);

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(text.trim());
    } catch (error) {
      reportError(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save} className="flex flex-col gap-2">
      <textarea
        aria-label={label}
        rows={3}
        autoFocus
        value={text}
        maxLength={maxLength}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-control border border-line bg-surface px-3 py-2 text-sm outline-none transition-colors focus:border-primary"
      />
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-muted">
          {text.length} / {maxLength}
        </span>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>
    </form>
  );
}
