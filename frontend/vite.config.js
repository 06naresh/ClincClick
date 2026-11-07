import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/tests/setup.js",
    include: ["src/**/*.?(*.){test,spec}.?(c|m)[jt]s?(x)"],
    exclude: ["tests/e2e/**", "node_modules/**", "dist/**"],
  },
})
