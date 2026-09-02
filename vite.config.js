import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Dev-only: serve the `/api` serverless functions inside the Vite dev server, so
// `bun run dev` is a full local environment (no Vercel CLI needed). In production
// Vercel runs the same files under `/api` natively; this plugin does nothing there.
function devApi() {
  return {
    name: 'dev-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api/state', async (req, res) => {
        // Parse JSON body (Vercel does this automatically; the dev server doesn't).
        if (req.method === 'PUT' || req.method === 'POST') {
          const chunks = []
          for await (const c of req) chunks.push(c)
          const raw = Buffer.concat(chunks).toString('utf8')
          try { req.body = raw ? JSON.parse(raw) : undefined } catch { req.body = undefined }
        }
        // Shim the Vercel res helpers onto the Node response.
        res.status = (c) => { res.statusCode = c; return res }
        res.json = (obj) => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(obj)); return res }
        try {
          const { default: handler } = await server.ssrLoadModule('/api/state.js')
          await handler(req, res)
        } catch (e) {
          res.statusCode = 500
          res.end(JSON.stringify({ error: 'dev api error', detail: String(e?.message || e) }))
        }
      })
    },
  }
}

// Preload the Latin Inter file from the HTML so first paint lands in the real
// typeface without waiting for CSS → font discovery (one fewer round trip on LCP).
function preloadFonts() {
  return {
    name: 'preload-fonts',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(_html, ctx) {
        const file = Object.keys(ctx.bundle || {}).find(k => /inter-latin-wght-normal.*\.woff2$/.test(k))
        if (!file) return []
        return [{ tag: 'link', attrs: { rel: 'preload', as: 'font', type: 'font/woff2', crossorigin: '', href: '/' + file }, injectTo: 'head' }]
      },
    },
  }
}

export default defineConfig(({ mode }) => {
  // Load ALL env vars (not just VITE_*) so the dev API handler can read the
  // server-only CLERK_SECRET_KEY / MONGODB_URI from .env.local.
  const env = loadEnv(mode, process.cwd(), '')
  for (const k of ['CLERK_SECRET_KEY', 'MONGODB_URI', 'MONGODB_DB']) {
    if (env[k]) process.env[k] = env[k]
  }
  return {
    plugins: [react(), tailwindcss(), devApi(), preloadFonts()],
    // Pre-bundle the lazily imported Clerk locale so the dev server never 504s on first use.
    optimizeDeps: { include: ['@clerk/localizations/ar-SA'] },
    server: { port: 3000, host: true, strictPort: true },
    preview: { port: 3000, host: true, strictPort: true },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            charts: ['recharts'],
            clerk: ['@clerk/clerk-react'],
            xlsx: ['xlsx'],
          },
        },
      },
    },
  }
})
