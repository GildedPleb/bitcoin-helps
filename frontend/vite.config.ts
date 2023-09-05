// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable import/no-extraneous-dependencies */
import react from "@vitejs/plugin-react-swc";
import dotenv from "dotenv";
import { defineConfig } from "vite";

dotenv.config();

const { STAGE, VITE_APP_STAGE, DOMAIN } = process.env;
const PARSED_DOMAIN = `https://${
  STAGE === "dev" || STAGE === "" || STAGE === undefined ? "dev." : ""
}${DOMAIN ?? "broken"}`;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: VITE_APP_STAGE === "dev" ? "test-build" : "dist",
  },
  define: {
    "import.meta.env.VITE_DOMAIN_STAGED": JSON.stringify(PARSED_DOMAIN),
  },
});
