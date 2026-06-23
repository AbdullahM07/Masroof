// Thin client for the cloud-sync API. The Clerk session token is passed in and
// sent as a Bearer header; the serverless function verifies it and scopes all
// reads/writes to that user.
async function request(path, token, opts = {}) {
  const res = await fetch(path, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(opts.headers || {}),
    },
  })
  if (!res.ok) throw new Error(`API ${res.status}`)
  return res.json()
}

// Returns the saved state object, or null for a brand-new user.
export async function fetchState(token) {
  const { state } = await request('/api/state', token)
  return state
}

export async function saveStateRemote(token, state) {
  return request('/api/state', token, { method: 'PUT', body: JSON.stringify({ state }) })
}
