import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
      },
      manifest: {
        name: 'Notakok - Cloud Storage', 
        short_name: 'Notakok',        
        description: 'Your personal and secure cloud storage for media and files.', 
        theme_color: '#007aff',       
        background_color: '#ffffff', 
        display: 'standalone',      
        scope: '/',                
        start_url: '/',            
        orientation: 'portrait', 
        icons: [
          {
            src: '/pwa-192x192.png', 
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable' 
          }
        ]
      }
    })
  ],
})