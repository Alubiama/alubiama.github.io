/**
 * Cloudflare Worker proxy for Coinbase CDP Paymaster.
 *
 * Env vars (set via `wrangler secret put`):
 *   CDP_API_KEY  – your Coinbase Developer Platform API key
 *
 * Deploy:
 *   cd paymaster-proxy
 *   npx wrangler deploy
 *
 * After deploy set VITE_PAYMASTER_URL to the worker URL in your .env:
 *   VITE_PAYMASTER_URL=https://still-basing-paymaster.<you>.workers.dev
 */

const ALLOWED_ORIGINS = [
  'https://alubiama.github.io',
  'http://localhost:5173',
]

function corsHeaders(origin) {
  const headers = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  }
  if (ALLOWED_ORIGINS.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin
  }
  return headers
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || ''

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) })
    }

    // Only POST allowed
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 })
    }

    // Verify origin
    if (!ALLOWED_ORIGINS.includes(origin)) {
      return new Response('Forbidden', { status: 403 })
    }

    if (!env.CDP_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Paymaster not configured' }),
        { status: 503, headers: { 'Content-Type': 'application/json' } },
      )
    }

    // Forward JSON-RPC request to CDP paymaster endpoint
    const cdpUrl = `https://api.developer.coinbase.com/rpc/v1/base/${env.CDP_API_KEY}`
    const body = await request.text()

    const upstream = await fetch(cdpUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    })

    const responseBody = await upstream.text()

    return new Response(responseBody, {
      status: upstream.status,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders(origin),
      },
    })
  },
}
