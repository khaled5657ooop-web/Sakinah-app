import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: [
          'icon.svg',
          'apple-touch-icon.png',
          'favicon-32x32.png',
          'offline.html',
          'robots.txt',
          'sitemap.xml',
          'og-cover.jpg',
        ],
        manifest: {
          id: '/',
          name: 'SAKINAH | سَكِينَة',
          short_name: 'SAKINAH',
          description:
            'سكينة منصة إسلامية مجانية للجميع، تتيح قراءة القرآن الكريم والاستماع إليه، والأذكار والأدعية والأحاديث النبوية ومواقيت الصلاة.',
          lang: 'ar',
          dir: 'rtl',
          theme_color: '#021812',
          background_color: '#021812',
          display: 'standalone',
          orientation: 'portrait-primary',
          start_url: '/',
          scope: '/',
          categories: ['books', 'education', 'lifestyle'],
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
          shortcuts: [
            {
              name: 'القرآن الكريم',
              short_name: 'القرآن',
              url: '/?section=quran',
              icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }],
            },
            {
              name: 'استمع للقرآن',
              short_name: 'تلاوات',
              url: '/?section=listen',
              icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }],
            },
            {
              name: 'الأذكار والمسبحة',
              short_name: 'الأذكار',
              url: '/?section=adhkar',
              icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }],
            },
            {
              name: 'الأحاديث النبوية',
              short_name: 'الحديث',
              url: '/?section=hadith',
              icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }],
            },
            {
              name: 'الصلاة والقبلة',
              short_name: 'الصلاة',
              url: '/?section=prayer',
              icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }],
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,woff2}'],
          navigateFallback: '/index.html',
          navigateFallbackDenylist: [/^\/api\//, /\/offline\.html$/],
          runtimeCaching: [
            // Never cache server API endpoints so daily updates, telemetry, and admin sessions stay live
            {
              urlPattern: /^\/api\/.*/i,
              handler: 'NetworkOnly',
            },
            // Never cache live prayer timings in service worker so daily schedules cannot go stale
            {
              urlPattern: /^https:\/\/api\.aladhan\.com\/.*/i,
              handler: 'NetworkOnly',
            },
            // Audio recitations stream directly from network; never bloat cache storage
            {
              urlPattern: /^https:\/\/(verses\.quran\.com|download\.quranicaudio\.com|audio\.qurancdn\.com|cdn\.mp3quran\.net|server\d+\.mp3quran\.net)\/.*/i,
              handler: 'NetworkOnly',
            },
            // Quran text/tafsir lookups prefer network and fall back gently for recently viewed surahs
            {
              urlPattern: /^https:\/\/api\.quran\.com\/api\/v4\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'sakinah-quran-api',
                networkTimeoutSeconds: 6,
                expiration: {
                  maxEntries: 60,
                  maxAgeSeconds: 60 * 60 * 24 * 7,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            // Google Fonts stylesheets
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'google-fonts-stylesheets',
              },
            },
            // Google Fonts webfont binaries
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-webfonts',
                expiration: {
                  maxEntries: 20,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: true,
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
