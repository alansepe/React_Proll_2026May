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
build: {
    rollupOptions: {
      // Add the package name(s) you want to exclude from the bundle here
      external: ['your-package-name', 'another-package'],
      
      // If you're building a library, you often need to provide global 
      // variables for these externalized dependencies
      output: {
        globals: {
          'your-package-name': 'React_Proll_2026May'
        }
      }
    }
},
  

  
})
