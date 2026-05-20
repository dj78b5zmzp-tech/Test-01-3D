import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/', // 本地开发用根路径，部署前改回 '/Test-01-3D/'
  server: { port: 5173, host: true },
})
