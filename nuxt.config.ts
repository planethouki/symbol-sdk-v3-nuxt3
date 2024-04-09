// https://nuxt.com/docs/api/configuration/nuxt-config
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill'
import { fileURLToPath } from 'url'
import wasm from 'vite-plugin-wasm'

// https://zenn.dev/kra8/articles/c9ed05abb90d60
// https://medium.com/@ftaioli/using-node-js-builtin-modules-with-vite-6194737c2cd2

export default defineNuxtConfig({
  devtools: { enabled: true },
  runtimeConfig: {
    public: {
      PRIVATE_KEY: process.env.PRIVATE_KEY,
      NODE_URL: process.env.NODE_URL,
    }
  },
  vite: {
    plugins: [wasm()],
    resolve: {
      alias: [
        {
          find: /symbol-crypto-wasm-node/,
          replacement: fileURLToPath(new URL('./node_modules/symbol-crypto-wasm-web/symbol_crypto_wasm.js', import.meta.url))
        }
      ]
    },
    optimizeDeps: {
      esbuildOptions: {
        define: {
          global: 'globalThis'
        },
        plugins: [
          NodeGlobalsPolyfillPlugin({
            process: true,
            buffer: true
          }),
          NodeModulesPolyfillPlugin()
        ]
      },
    }
  }
})
