export type Theme = "light" | "dark";

const STORAGE_KEY = "theme";

// first set by the inline script in index.html
export function getTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

// keeps all colours switching at the same moment
function applyWithoutTransitions(theme: Theme): void {
  const style = document.createElement("style");
  style.textContent = "* { transition: none !important; }";
  document.head.append(style);
  document.documentElement.dataset.theme = theme;
  // forces the new colours before transitions return
  void getComputedStyle(document.body).color;
  style.remove();
}

export function setTheme(theme: Theme): void {
  applyWithoutTransitions(theme);
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // storage can be blocked
  }
}
