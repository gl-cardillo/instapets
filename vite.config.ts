import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // served from https://gl-cardillo.github.io/instapets/
  base: "/instapets/",
  build: {
    rolldownOptions: {
      output: {
        // libraries get their own files, cached across deploys
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
    // firebase is ~175 kB gzipped and needed on every page
    chunkSizeWarningLimit: 700,
  },
});
