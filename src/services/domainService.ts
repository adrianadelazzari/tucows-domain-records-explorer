import type { Domain } from '../types/domain'

export async function fetchDomains(): Promise<Domain[]> {
  const res = await fetch('/api/v1/domains')
  if (!res.ok) throw new Error('Failed to fetch domain records. Please try again.')
  const json = await res.json()
  if (!Array.isArray(json.data)) throw new Error('Failed to fetch domain records. Please try again.')
  return json.data as Domain[]
}
