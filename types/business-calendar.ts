export type RecurringFrequency = 'weekly' | 'monthly' | 'quarterly' | 'yearly'

export type RecurringEvent = {
  id: string
  name: string
  frequency: RecurringFrequency
  description?: string
  nextDate?: string
}

export type LaunchType =
  | 'product'
  | 'event'
  | 'collection'
  | 'partnership'
  | 'other'

export type UpcomingLaunch = {
  id: string
  name: string
  date: string
  type: LaunchType
  description: string
}

export type Season = 'spring' | 'summer' | 'fall' | 'winter'
export type ActivityLevel = 'low' | 'medium' | 'high'

export type SeasonalPeriod = {
  season: Season
  activityLevel: ActivityLevel
  keyTopics: string[]
}

export type IndustryRelevance = 'core' | 'adjacent' | 'optional'

export type IndustryEvent = {
  id: string
  name: string
  date: string
  relevance: IndustryRelevance
}

export type BusinessCalendar = {
  recurringEvents: RecurringEvent[]
  upcomingLaunches: UpcomingLaunch[]
  seasonality: SeasonalPeriod[]
  industryEvents: IndustryEvent[]
}

export const EMPTY_BUSINESS_CALENDAR: BusinessCalendar = {
  recurringEvents: [],
  upcomingLaunches: [],
  seasonality: [],
  industryEvents: [],
}
