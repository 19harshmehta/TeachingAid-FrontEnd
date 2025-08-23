import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from 'vite-plugin-pwa'; // Import the plugin
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    // Add the VitePWA plugin here
    VitePWA({
      registerType: 'autoUpdate',
      // This will inject a script into your index.html to register the service worker.
      injectRegister: 'script',
      workbox: {
        // This tells the service worker which files to cache for offline use.
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}']
      },
      // This is where we define your app's manifest details.
      manifest: {
        name: "PollSync",
        short_name: "PollSync",
        description: "A real-time polling platform for interactive sessions.",
        theme_color: "#7c3aed",
        background_color: "#ffffff",
        display: "standalone",
        start_url: ".",
        icons: [
          {
            src: 'icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'icon-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));