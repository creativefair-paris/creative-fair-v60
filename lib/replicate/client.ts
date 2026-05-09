import Replicate from 'replicate'

let cached: Replicate | null = null

export function getReplicate(): Replicate {
  if (cached) return cached
  const token = process.env.REPLICATE_API_TOKEN
  if (!token) {
    throw new Error('REPLICATE_API_TOKEN manquant')
  }
  cached = new Replicate({ auth: token })
  return cached
}
