import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // GitHub Pages project site: https://tylermoline66.github.io/tyler-profile/
  // Keep `/` in local `vite` so dev stays at http://localhost:5173/
  base: command === 'build' ? '/tyler-profile/' : '/',
  plugins: [react()],
}))
