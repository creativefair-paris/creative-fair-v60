// Wrapper Flux Dev — implémentation Sprint 36 (Moodboard, Variations)
import { getReplicate } from '@/lib/replicate/client'

export type FluxInput = {
  prompt: string
  numOutputs?: number
  aspectRatio?: '1:1' | '4:3' | '16:9'
}

export async function runFlux(_input: FluxInput): Promise<string[]> {
  const _client = getReplicate()
  const _version = process.env.REPLICATE_FLUX_MODEL_VERSION
  if (!_version) {
    throw new Error('REPLICATE_FLUX_MODEL_VERSION manquant')
  }
  throw new Error('runFlux: implémentation Sprint 36')
}
