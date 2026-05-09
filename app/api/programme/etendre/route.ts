// Stub Sprint 32.5 — implémentation Sprint 35
import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    { error: 'Not Implemented', sprint: 35 },
    { status: 501 },
  )
}
