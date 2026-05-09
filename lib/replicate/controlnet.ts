// Wrapper ControlNet — implémentation Sprint 36 (Moodboard style, Variations pose/depth)
import { getReplicate } from '@/lib/replicate/client'

export type ControlNetMode = 'style' | 'pose' | 'depth'

export type ControlNetInput = {
  prompt: string
  controlImage: string
  mode: ControlNetMode
}

export async function runControlNet(_input: ControlNetInput): Promise<string[]> {
  const _client = getReplicate()
  const _version = process.env.REPLICATE_CONTROLNET_MODEL_VERSION
  if (!_version) {
    throw new Error('REPLICATE_CONTROLNET_MODEL_VERSION manquant')
  }
  throw new Error('runControlNet: implémentation Sprint 36')
}
