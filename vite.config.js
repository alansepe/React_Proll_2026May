import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
server: {
    hmr: {
      // Set to true (default) to enable or false to disable the error overlay
      overlay: false,
    },
  },


  
})
