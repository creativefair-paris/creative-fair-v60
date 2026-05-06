'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  getBrandIdForCurrentUser,
  updateBusinessCalendar,
} from '@/lib/supabase/brands'
import {
  EMPTY_BUSINESS_CALENDAR,
  type BusinessCalendar,
  type RecurringEvent,
  type RecurringFrequency,
  type UpcomingLaunch,
  type LaunchType,
  type SeasonalPeriod,
  type Season,
  type ActivityLevel,
  type IndustryEvent,
  type IndustryRelevance,
} from '@/types/business-calendar'

async function loadCalendar() {
  const supabase = await createClient()
  const ctx = await getBrandIdForCurrentUser(supabase)
  if (!ctx) throw new Error('No brand for current user')

  const { data, error } = await supabase
    .from('brands')
    .select('business_calendar')
    .eq('id', ctx.brandId)
    .maybeSingle()

  if (error) throw error

  const raw = (data as { business_calendar?: BusinessCalendar | null } | null)
    ?.business_calendar
  const calendar: BusinessCalendar = raw ?? { ...EMPTY_BUSINESS_CALENDAR }
  return { supabase, brandId: ctx.brandId, calendar }
}

function generateId(): string {
  return crypto.randomUUID()
}

export async function addRecurringEvent(formData: FormData): Promise<void> {
  const { supabase, brandId, calendar } = await loadCalendar()

  const name = String(formData.get('name') ?? '').trim()
  const frequency = String(formData.get('frequency') ?? '') as RecurringFrequency
  const description = String(formData.get('description') ?? '').trim() || undefined

  if (!name || !frequency) return

  const event: RecurringEvent = {
    id: generateId(),
    name,
    frequency,
    description,
  }

  const next: BusinessCalendar = {
    ...calendar,
    recurringEvents: [...calendar.recurringEvents, event],
  }

  await updateBusinessCalendar(supabase, brandId, next)
  revalidatePath('/ma-marque/business-calendar')
}

export async function removeRecurringEvent(id: string): Promise<void> {
  const { supabase, brandId, calendar } = await loadCalendar()

  const next: BusinessCalendar = {
    ...calendar,
    recurringEvents: calendar.recurringEvents.filter((e) => e.id !== id),
  }

  await updateBusinessCalendar(supabase, brandId, next)
  revalidatePath('/ma-marque/business-calendar')
}

export async function addUpcomingLaunch(formData: FormData): Promise<void> {
  const { supabase, brandId, calendar } = await loadCalendar()

  const name = String(formData.get('name') ?? '').trim()
  const date = String(formData.get('date') ?? '').trim()
  const type = String(formData.get('type') ?? '') as LaunchType
  const description = String(formData.get('description') ?? '').trim()

  if (!name || !date || !type) return

  const launch: UpcomingLaunch = {
    id: generateId(),
    name,
    date,
    type,
    description,
  }

  const next: BusinessCalendar = {
    ...calendar,
    upcomingLaunches: [...calendar.upcomingLaunches, launch].sort((a, b) =>
      a.date.localeCompare(b.date),
    ),
  }

  await updateBusinessCalendar(supabase, brandId, next)
  revalidatePath('/ma-marque/business-calendar')
}

export async function removeUpcomingLaunch(id: string): Promise<void> {
  const { supabase, brandId, calendar } = await loadCalendar()

  const next: BusinessCalendar = {
    ...calendar,
    upcomingLaunches: calendar.upcomingLaunches.filter((e) => e.id !== id),
  }

  await updateBusinessCalendar(supabase, brandId, next)
  revalidatePath('/ma-marque/business-calendar')
}

export async function setSeasonalPeriod(formData: FormData): Promise<void> {
  const { supabase, brandId, calendar } = await loadCalendar()

  const season = String(formData.get('season') ?? '') as Season
  const activityLevel = String(formData.get('activityLevel') ?? '') as ActivityLevel
  const keyTopicsRaw = String(formData.get('keyTopics') ?? '').trim()

  if (!season || !activityLevel) return

  const keyTopics = keyTopicsRaw
    ? keyTopicsRaw
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
    : []

  const period: SeasonalPeriod = { season, activityLevel, keyTopics }

  const others = calendar.seasonality.filter((p) => p.season !== season)
  const next: BusinessCalendar = {
    ...calendar,
    seasonality: [...others, period],
  }

  await updateBusinessCalendar(supabase, brandId, next)
  revalidatePath('/ma-marque/business-calendar')
}

export async function addIndustryEvent(formData: FormData): Promise<void> {
  const { supabase, brandId, calendar } = await loadCalendar()

  const name = String(formData.get('name') ?? '').trim()
  const date = String(formData.get('date') ?? '').trim()
  const relevance = String(formData.get('relevance') ?? '') as IndustryRelevance

  if (!name || !date || !relevance) return

  const event: IndustryEvent = {
    id: generateId(),
    name,
    date,
    relevance,
  }

  const next: BusinessCalendar = {
    ...calendar,
    industryEvents: [...calendar.industryEvents, event].sort((a, b) =>
      a.date.localeCompare(b.date),
    ),
  }

  await updateBusinessCalendar(supabase, brandId, next)
  revalidatePath('/ma-marque/business-calendar')
}

export async function removeIndustryEvent(id: string): Promise<void> {
  const { supabase, brandId, calendar } = await loadCalendar()

  const next: BusinessCalendar = {
    ...calendar,
    industryEvents: calendar.industryEvents.filter((e) => e.id !== id),
  }

  await updateBusinessCalendar(supabase, brandId, next)
  revalidatePath('/ma-marque/business-calendar')
}
