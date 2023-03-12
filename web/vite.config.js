import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa"
import { icons } from "react-icons";

export default defineConfig({
  plugins: [
    react(), 
    VitePWA()
  ],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: "http://127.0.0.1:5000",
        changeOrigin: true,
        secure: false,
        ws:true
      }
    }
  },
})