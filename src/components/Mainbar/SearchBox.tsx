import { useState, type FormEvent, type MouseEvent } from "react";
import { Link, useNavigate } from "react-router";
import { IoSearch } from "react-icons/io5";
import { useUserSearch } from "../../hooks/useUserSearch";
import { Avatar } from "../Avatar/Avatar";

export function SearchBox({ className = "" }: { className?: string }) {
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const { users } = useUserSearch(text, 8);

  // keeps the input focused when clicking a result, so the click lands
  // before the blur clears the results
  const keepFocus = (e: MouseEvent) => e.preventDefault();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    navigate(`/searchPage?q=${encodeURIComponent(text)}`);
    setText("");
  };

  return (
    <form
      role="search"
      onSubmit={submit}
      className={`relative w-full max-w-xs ${className}`}
    >
      <input
        type="text"
        aria-label="Search pets"
        value={text}
        placeholder="Search pets..."
        onChange={(e) => setText(e.target.value)}
        onBlur={() => setText("")}
        onKeyDown={(e) => {
          if (e.key === "Escape") setText("");
        }}
        className="box-border w-full rounded-pill border border-line bg-page py-2 pr-10 pl-4 text-ink outline-none transition-colors focus:border-primary"
      />
      <button
        type="submit"
        aria-label="Search"
        onMouseDown={keepFocus}
        className="absolute top-1/2 right-3 flex -translate-y-1/2 cursor-pointer border-0 bg-transparent text-muted hover:text-primary"
      >
        <IoSearch className="size-5" />
      </button>
      {users.length > 0 && (
        <div className="absolute top-full z-30 mt-2 max-h-72 w-full overflow-y-auto rounded-card border border-line bg-surface shadow-card">
          {users.map((user) => (
            <Link
              key={user.username}
              to={`/profile/${user.username}`}
              onMouseDown={keepFocus}
              onClick={() => setText("")}
              className="flex items-center gap-3 px-4 py-2 font-bold text-ink hover:bg-surface-hover"
            >
              <Avatar src={user.profilePic} className="size-8" />
              {user.username}
            </Link>
          ))}
        </div>
      )}
    </form>
  );
}
