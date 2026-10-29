import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // served from https://gl-cardillo.github.io/instapets/
  base: "/instapets/",
  build: {
    rolldownOptions: {
      output: {
        // Libraries change far less often than the app, so they get their
        // own files that browsers keep cached across deploys.
        codeSplitting: {
          groups: [
            { name: "firebase", test: /node_modules[\\/]@?firebase/ },
            {
              name: "react",
              test: /node_modules[\\/](react|react-dom|react-router|scheduler)[\\/]/,
            },
            { name: "vendor", test: /node_modules/ },
          ],
        },
      },
    },
    // Firebase alone is ~580 kB minified (~175 kB gzipped); it can't be
    // trimmed further, since Firestore and Auth are needed on every page
    chunkSizeWarningLimit: 700,
  },
});
