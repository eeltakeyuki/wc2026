import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg', 'icons/*.png'],
        manifest: {
          name: 'FIFA W杯 2026',
          short_name: 'W杯2026',
          description: '2026 FIFAワールドカップ リアルタイム結果・スケジュール',
          theme_color: '#0f172a',
          background_color: '#0f172a',
          display: 'standalone',
          start_url: '/',
          lang: 'ja',
          icons: [
            { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
            { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
          ],
        },
        workbox: {
          navigateFallback: 'index.html',
          navigateFallbackDenylist: [/^\/api\//],
          runtimeCaching: [
            {
              // API リクエストは常にネットワーク経由（キャッシュしない）
              urlPattern: /^\/api\//,
              handler: 'NetworkOnly',
            },
            {
              // チームエンブレム画像はキャッシュして高速化
              urlPattern: /^https:\/\/crests\.football-data\.org\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'team-crests',
                expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 7 },
              },
            },
          ],
        },
      }),
    ],
    server: {
      proxy: {
        '/api/competitions/WC/matches': {
          target: 'https://api.football-data.org/v4',
          changeOrigin: true,
          rewrite: () => '/competitions/WC/matches',
          headers: { 'X-Auth-Token': env.VITE_API_KEY ?? '' },
        },
        '/api/competitions/WC/standings': {
          target: 'https://api.football-data.org/v4',
          changeOrigin: true,
          rewrite: () => '/competitions/WC/standings',
          headers: { 'X-Auth-Token': env.VITE_API_KEY ?? '' },
        },
        '/api/competitions/WC/scorers': {
          target: 'https://api.football-data.org/v4',
          changeOrigin: true,
          rewrite: () => '/competitions/WC/scorers',
          headers: { 'X-Auth-Token': env.VITE_API_KEY ?? '' },
        },
        '/api/matches': {
          target: 'https://api.football-data.org/v4',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/matches\/(\d+)$/, '/matches/$1/head2head'),
          headers: { 'X-Auth-Token': env.VITE_API_KEY ?? '' },
        },
      },
    },
  }
})
