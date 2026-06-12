import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
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
