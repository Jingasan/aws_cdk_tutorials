import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      "/v1/hello":
        "https://785f9v6ndd.execute-api.ap-northeast-1.amazonaws.com/v1/hello",
    },
  },
  plugins: [react()],
  define: {
    "window.global": {},
  },
});
