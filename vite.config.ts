import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

function getPackageChunkName(id: string) {
  if (!id.includes('node_modules')) {
    return null
  }

  if (
    id.includes('/node_modules/react/') ||
    id.includes('/node_modules/react-dom/') ||
    id.includes('/node_modules/scheduler/') ||
    id.includes('/node_modules/use-sync-external-store/')
  ) {
    return 'vendor-react'
  }

  if (
    id.includes('/node_modules/tldraw/') ||
    id.includes('/node_modules/@tldraw/')
  ) {
    return 'vendor-tldraw'
  }

  if (
    id.includes('/node_modules/wa-sqlite/') ||
    id.includes('/node_modules/idb/')
  ) {
    return 'vendor-storage'
  }

  if (
    id.includes('/node_modules/@tiptap/') ||
    id.includes('/node_modules/prosemirror') ||
    id.includes('/node_modules/linkifyjs/')
  ) {
    return 'vendor-rich-text'
  }

  if (
    id.includes('/node_modules/@radix-ui/') ||
    id.includes('/node_modules/@floating-ui/') ||
    id.includes('/node_modules/react-remove-scroll') ||
    id.includes('/node_modules/aria-hidden/') ||
    id.includes('/node_modules/use-sidecar/') ||
    id.includes('/node_modules/react-style-singleton/')
  ) {
    return 'vendor-ui'
  }

  if (
    id.includes('/node_modules/@use-gesture/') ||
    id.includes('/node_modules/hotkeys-js/') ||
    id.includes('/node_modules/lodash.') ||
    id.includes('/node_modules/lz-string/') ||
    id.includes('/node_modules/rbush/') ||
    id.includes('/node_modules/quickselect/') ||
    id.includes('/node_modules/eventemitter3/') ||
    id.includes('/node_modules/fractional-indexing') ||
    id.includes('/node_modules/jittered-fractional-indexing') ||
    id.includes('/node_modules/rope-sequence/') ||
    id.includes('/node_modules/w3c-keyname/') ||
    id.includes('/node_modules/classnames/')
  ) {
    return 'vendor-utils'
  }

  return 'vendor-misc'
}

export default defineConfig({
  plugins: [react()],
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2022',
    chunkSizeWarningLimit: 1100,
    cssCodeSplit: true,
    rollupOptions: {
      input: {
        overlay: resolve(__dirname, 'overlay.html'),
        background: resolve(__dirname, 'src/background.ts'),
        content: resolve(__dirname, 'src/content/index.ts')
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name].js',
        assetFileNames: 'assets/[name][extname]',
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined
          }

          return getPackageChunkName(id) ?? undefined
        }
      }
    }
  }
})