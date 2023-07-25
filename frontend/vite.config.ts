import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: process.env.VITE_APP_STAGE === "dev" ? "test-build" : "dist",
  },
});
