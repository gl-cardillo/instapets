import { useState } from "react";
import { IoMoonOutline, IoSunnyOutline } from "react-icons/io5";
import { getTheme, setTheme, type Theme } from "../../utils/theme";
import { IconButton } from "../ui/IconButton";

export function ThemeToggle() {
  const [theme, setThemeState] = useState<Theme>(getTheme);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    setThemeState(next);
  };

  return (
    <IconButton
      label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      onClick={toggle}
    >
      {theme === "dark" ? (
        <IoSunnyOutline className="icons" />
      ) : (
        <IoMoonOutline className="icons" />
      )}
    </IconButton>
  );
}
