import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  base: "./",
  server: {
    proxy: {
      "/api/v1": {
        target: "https://auth.privy.io",
        changeOrigin: true,
        secure: false,
      },
      "/privy-api": {
        target: "https://auth.privy.io",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/privy-api/, ""),
      },
    },
  },
});