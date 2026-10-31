export type Theme = "light" | "dark";

const STORAGE_KEY = "theme";

// The theme is first set by the inline script in index.html, before the page
// paints, so it never flashes the wrong colours.
export function getTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

export function setTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // storage can be blocked; the choice just won't survive a reload
  }
}
