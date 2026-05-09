// Stub Sprint 32.5 — implémentation Sprint 36
import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    { error: 'Not Implemented', sprint: 36 },
    { status: 501 },
  )
}
