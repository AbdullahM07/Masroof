// Cached MongoDB connection for Vercel serverless functions. The client is
// memoised on globalThis so warm invocations reuse one pool instead of opening
// a new connection per request (serverless cold-start best practice).
import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI

let cached = globalThis._mongo
if (!cached) cached = globalThis._mongo = { client: null, promise: null }

async function getClient() {
  if (!uri) throw new Error('MONGODB_URI is not set')
  if (cached.client) return cached.client
  if (!cached.promise) {
    cached.promise = new MongoClient(uri, { maxPoolSize: 5 }).connect()
  }
  cached.client = await cached.promise
  return cached.client
}

// Collection holding one document per user: { _id: <clerkUserId>, state, updatedAt }.
export async function userStates() {
  const client = await getClient()
  const db = client.db(process.env.MONGODB_DB || undefined)
  return db.collection('userStates')
}
