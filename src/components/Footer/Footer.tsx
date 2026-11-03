import { BsGithub } from "react-icons/bs";

export function Footer() {
  return (
    <footer className="flex items-center justify-center gap-2 border-t border-line bg-surface p-2 text-sm text-muted">
      <a
        href="https://github.com/gl-cardillo"
        target="_blank"
        rel="noreferrer"
        aria-label="Luca Cardillo on GitHub"
        className="flex hover:text-primary"
      >
        <BsGithub />
      </a>
      <p>Made by Luca Cardillo</p>
    </footer>
  );
}
