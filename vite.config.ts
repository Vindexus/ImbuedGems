// vite.config.ts
import { defineConfig, optimizeDeps } from 'vite'
import tsConfigPaths from 'vite-tsconfig-paths'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

let num = 0;
export default defineConfig({
  base: '/ImbuedGems/',
  server: {
    port: 3000,
  },
  plugins: [
    tsConfigPaths(),
    tanstackStart({
      prerender: {
        enabled: true,
        autoSubfolderIndex: true,
        autoStaticPathsDiscovery: true,
        crawlLinks: true,
        failOnError: true,
        filter: (opts) => {
          // Too many links if we include all of these
          if (opts.path.includes('?selected')) {
            return false
          }
          return true
        }
      },
    }),
    tailwindcss(),

    // react's vite plugin must come after start's vite plugin
    viteReact(),
  ],
})