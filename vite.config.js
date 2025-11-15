import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    https: {
      key: fs.readFileSync(path.join('certs', 'server.key')),
      cert: fs.readFileSync(path.join('certs', 'server.cert')),
    },
    port: 5173,
  },
})
