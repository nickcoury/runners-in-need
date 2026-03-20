// @ts-check
import { defineConfig } from 'astro/config';
import { execSync } from 'node:child_process';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';
import auth from 'auth-astro';

const gitCommit = process.env.GITHUB_SHA?.slice(0, 7) ??
  (() => { try { return execSync('git rev-parse --short HEAD').toString().trim(); } catch { return 'unknown'; } })();

// https://astro.build/config
export default defineConfig({
  integrations: [react(), auth({ configFile: './src/lib/auth' })],

  vite: {
    define: {
      __GIT_COMMIT__: JSON.stringify(gitCommit),
    },
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