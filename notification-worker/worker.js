/**
 * Still Basing — Notification Worker (Cloudflare Worker)
 *
 * Stores Farcaster notification tokens in KV and sends daily reminders.
 *
 * Setup:
 * 1. Create a KV namespace: wrangler kv namespace create NOTIF_TOKENS
 * 2. Add the binding to wrangler.toml
 * 3. Deploy: wrangler deploy
 * 4. Add a cron trigger in wrangler.toml: [triggers] crons = ["0 9 * * *"]
 * 5. Set webhookUrl in farcaster.json to this worker's URL
 */

export default {
  // HTTP handler — receives token registrations from the app
  async fetch(request, env) {
    const url = new URL(request.url)

    // CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': 'https://alubiama.github.io',
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      })
    }

    const corsHeaders = {
      'Access-Control-Allow-Origin': 'https://alubiama.github.io',
      'Content-Type': 'application/json',
    }

    // POST /register — store notification token
    if (url.pathname === '/register' && request.method === 'POST') {
      try {
        const { fid, token, notifUrl } = await request.json()
        if (!fid || !token || !notifUrl) {
          return new Response(JSON.stringify({ error: 'Missing fid, token, or notifUrl' }), {
            status: 400,
            headers: corsHeaders,
          })
        }

        // Store by FID so each user has one entry
        await env.NOTIF_TOKENS.put(`fid:${fid}`, JSON.stringify({ token, notifUrl, registeredAt: Date.now() }))

        return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders })
      } catch (err) {
        return new Response(JSON.stringify({ error: 'Invalid request' }), {
          status: 400,
          headers: corsHeaders,
        })
      }
    }

    // GET /stats — number of registered users (for debugging)
    if (url.pathname === '/stats' && request.method === 'GET') {
      const list = await env.NOTIF_TOKENS.list({ prefix: 'fid:' })
      return new Response(JSON.stringify({ registeredUsers: list.keys.length }), {
        headers: corsHeaders,
      })
    }

    return new Response('Not found', { status: 404 })
  },

  // Cron handler — sends daily reminders
  async scheduled(event, env) {
    const list = await env.NOTIF_TOKENS.list({ prefix: 'fid:' })

    for (const key of list.keys) {
      try {
        const raw = await env.NOTIF_TOKENS.get(key.name)
        if (!raw) continue
        const { token, notifUrl } = JSON.parse(raw)

        const res = await fetch(notifUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            notificationId: `daily-${Date.now()}`,
            title: 'Still Basing',
            body: 'Your streak is waiting! Press today to keep it going.',
            targetUrl: 'https://alubiama.github.io/',
            tokens: [token],
          }),
        })

        const result = await res.json()

        // Remove invalid tokens
        if (result?.result?.invalidTokens?.includes(token)) {
          await env.NOTIF_TOKENS.delete(key.name)
        }
      } catch (err) {
        console.error(`Failed to notify ${key.name}:`, err)
      }
    }
  },
}
