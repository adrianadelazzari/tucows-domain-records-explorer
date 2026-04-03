import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '../mocks/server'
import { fetchDomains } from '../services/domainService'
import { MOCK_DOMAINS } from '../api/domains'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('fetchDomains', () => {
  it('resolves with the domains from the API response', async () => {
    const result = await fetchDomains()
    expect(result).toEqual(MOCK_DOMAINS)
  })

  it('returns the data array from the response envelope', async () => {
    const result = await fetchDomains()
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBe(MOCK_DOMAINS.length)
  })

  it('throws when the server responds with a non-OK status', async () => {
    server.use(
      http.get('/api/v1/domains', () => {
        return HttpResponse.json({ error: { code: 'INTERNAL_ERROR' } }, { status: 500 })
      }),
    )
    await expect(fetchDomains()).rejects.toThrow('Failed to fetch domain records. Please try again.')
  })

  it('throws when the server responds with 404', async () => {
    server.use(
      http.get('/api/v1/domains', () => {
        return new HttpResponse(null, { status: 404 })
      }),
    )
    await expect(fetchDomains()).rejects.toThrow('Failed to fetch domain records. Please try again.')
  })
})
