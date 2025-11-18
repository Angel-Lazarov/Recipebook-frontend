import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from "path";

// Проверка дали сме локално
const isLocal = process.env.LOCAL_HTTPS === "true"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: isLocal
    ? {
      https: {
        key: fs.readFileSync(path.join('certs', 'server.key')),
        cert: fs.readFileSync(path.join('certs', 'server.cert')),
      },
      port: 5173,
    }
    : undefined, // за production / Render
})
