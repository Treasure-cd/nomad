import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'], 
      },
      manifest:   {
        "name": "nomad",
        "short_name": "nomad-app",
        "description": "Offline map",
        "start_url": "/",
        "display": "standalone",
        "background_color": "#04001b",
        "theme_color": "#ffd600",
        "orientation": "portrait",
        "icons": [
          {
            "src": "/icons/icon-192.png",
            "sizes": "192x192",
            "type": "image/png"
          },
          {
            "src": "/icons/icon-512.png",
            "sizes": "512x512",
            "type": "image/png"
          }
        ]
      }

    })
  ]
})

