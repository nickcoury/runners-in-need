// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';
import auth from 'auth-astro';

// https://astro.build/config
export default defineConfig({
  integrations: [react(), auth({ configFile: './src/lib/auth' })],

  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      exclude: ['auth:config', 'auth-astro'],
    },
    resolve: {
      alias: {
        'node-domexception': new URL('./src/lib/node-domexception-shim.js', import.meta.url).pathname,
      },
    },
  },

  adapter: cloudflare()
});