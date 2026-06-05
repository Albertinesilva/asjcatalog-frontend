import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api/proxy": {
        target: "http://localhost:8080",
        changeOrigin: true,
        rewrite: (proxyPath) => proxyPath.replace(/^\/api\/proxy/, ""),
      },
    },
  },
});
