import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // served from https://gl-cardillo.github.io/instapets/
  base: "/instapets/",
});
