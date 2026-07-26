import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function getStartOfTodayKolkata(): Date {
  const now = new Date()
  // Asia/Kolkata timezone offset is +05:30 (5.5 hours)
  const offsetMs = 5.5 * 60 * 60 * 1000
  const localMs = now.getTime() + offsetMs
  const localDate = new Date(localMs)
  // Create start of day in UTC for that local date
  const localStartOfDayMs = Date.UTC(
    localDate.getUTCFullYear(),
    localDate.getUTCMonth(),
    localDate.getUTCDate(),
    0,
    0,
    0,
    0
  )
  // Convert back to actual UTC time by subtracting offset
  return new Date(localStartOfDayMs - offsetMs)
}

export function isEventRegistrationOpen(eventDateInput: string | Date | undefined): boolean {
  if (!eventDateInput) return false
  const d = new Date(eventDateInput)
  if (isNaN(d.getTime())) return false

  // Asia/Kolkata timezone offset is +05:30 (5.5 hours)
  const offsetMs = 5.5 * 60 * 60 * 1000
  const localMs = d.getTime() + offsetMs
  const localDate = new Date(localMs)

  const localEndOfDayMs = Date.UTC(
    localDate.getUTCFullYear(),
    localDate.getUTCMonth(),
    localDate.getUTCDate(),
    23,
    59,
    59,
    999
  )

  const endOfDayMs = localEndOfDayMs - offsetMs
  return Date.now() <= endOfDayMs
}

