// GET  /api/state  → { state }  (the signed-in user's saved app state, or null)
// PUT  /api/state  → { ok }      (upsert the user's app state)
// Every request is authenticated with Clerk and scoped to that user's document.
import { requireUserId } from './_auth.js'
import { userStates } from './_db.js'

const MAX_BYTES = 6 * 1024 * 1024 // ~6 MB guard (receipt images can be large)

export default async function handler(req, res) {
  let userId
  try {
    userId = await requireUserId(req)
  } catch (e) {
    return res.status(e.status || 401).json({ error: 'Unauthorized' })
  }

  try {
    const col = await userStates()

    if (req.method === 'GET') {
      const doc = await col.findOne({ _id: userId })
      return res.status(200).json({ state: doc?.state ?? null })
    }

    if (req.method === 'PUT') {
      const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? req.body : null
      const state = body?.state
      if (!state || typeof state !== 'object' || Array.isArray(state)) {
        return res.status(400).json({ error: 'Invalid state' })
      }
      if (Buffer.byteLength(JSON.stringify(state)) > MAX_BYTES) {
        return res.status(413).json({ error: 'State too large' })
      }
      await col.updateOne(
        { _id: userId },
        { $set: { state, updatedAt: new Date() } },
        { upsert: true },
      )
      return res.status(200).json({ ok: true })
    }

    res.setHeader('Allow', 'GET, PUT')
    return res.status(405).json({ error: 'Method not allowed' })
  } catch {
    return res.status(500).json({ error: 'Server error' })
  }
}
