import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // 1. Naikkan batas peringatan jadi 1000kb (1MB) biar gak berisik
    chunkSizeWarningLimit: 1000,
    
    // 2. Pecah file vendor (library) agar tidak menumpuk di satu file
    rollupOptions: {
        output: {
            manualChunks(id) {
                if (id.includes('node_modules')) {
                    return 'vendor';
                }
            }
        }
    }
  }
})