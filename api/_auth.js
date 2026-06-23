// Verify the Clerk session token sent as `Authorization: Bearer <token>` and
// return the authenticated Clerk user id. Throws an error with `.status = 401`
// when the token is missing or invalid.
import { verifyToken } from '@clerk/backend'

export async function requireUserId(req) {
  const header = req.headers.authorization || req.headers.Authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  const unauthorized = () => Object.assign(new Error('Unauthorized'), { status: 401 })
  if (!token) throw unauthorized()
  try {
    const payload = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY })
    if (!payload?.sub) throw unauthorized()
    return payload.sub
  } catch {
    throw unauthorized()
  }
}
