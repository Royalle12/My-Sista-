import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icons/*.png'],
      manifest: {
        name: 'My Sista',
        short_name: 'MySista',
        description: 'Your personal wellness companion — content, community, and care.',
        theme_color: '#6B3FA0',
        background_color: '#FAFAFA',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          // Fix 1: purpose must be separate objects — 'any maskable' in one string
          // causes some browsers to reject the icon. Split into discrete entries.
          { src: 'icons/icon-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: 'icons/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        categories: ['health', 'lifestyle', 'wellness'],
        shortcuts: [
          {
            name: 'Daily Check-In',
            short_name: 'Check-In',
            description: 'Log your daily wellness',
            url: '/check-in',
            icons: [{ src: 'icons/icon-192x192.png', sizes: '192x192' }],
          },
        ],
      },
      workbox: {
        // Fix 4: exclude /admin from SW precache — admin is privileged, never serve stale
        globIgnores: ['**/admin*'],

        // Fix 5: navigateFallback — serves index.html for all navigation requests
        // when offline, enabling SPA routing to work without a network connection.
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api/, /^\/functions/],

        runtimeCaching: [
          // Fix 2: Yoco payment pages — NEVER cache, always require live network.
          // Caching payment pages could serve stale checkout flows — a security risk.
          {
            urlPattern: /^https:\/\/payments\.yoco\.com\/.*/i,
            handler: 'NetworkOnly',
          },
          {
            urlPattern: /^https:\/\/pay\.yoco\.com\/.*/i,
            handler: 'NetworkOnly',
          },

          // Network-first for Supabase REST API
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 86400 },
              networkTimeoutSeconds: 10,
            },
          },

          // Network-first for Supabase Edge Functions
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/functions\/.*/i,
            handler: 'NetworkOnly',
          },

          // Cache-first for Supabase Storage (images, assets)
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'supabase-storage-cache',
              expiration: { maxEntries: 200, maxAgeSeconds: 604800 },
            },
          },

          // Cache-first for Google Fonts stylesheets
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 31536000 },
            },
          },

          // Cache-first for Google Fonts static files (woff2)
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-static',
              expiration: { maxEntries: 10, maxAgeSeconds: 31536000 },
            },
          },
        ],
      },
      // Fix 3: only enable SW in dev when explicitly opted in via env var.
      // Running the SW in dev by default interferes with HMR and causes
      // confusing cache hits during active development.
      devOptions: {
        enabled: process.env.NODE_ENV === 'development' &&
                 process.env.VITE_SW_DEV === 'true',
      },
    }),
  ],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
