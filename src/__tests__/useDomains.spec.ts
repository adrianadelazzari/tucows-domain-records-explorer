import { describe, it, expect, vi, beforeEach } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { useDomains } from '../composables/useDomains'
import type { Domain } from '../types/domain'

vi.mock('../services/domainService')

import { fetchDomains } from '../services/domainService'
const mockFetch = vi.mocked(fetchDomains)

const FIXTURE: Domain[] = [
  {
    domain: 'alpha.com',
    registrar: 'Tucows',
    status: 'active',
    created_at: '2020-01-01T00:00:00Z',
    expires_at: '2027-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    nameservers: ['ns1.tucows.com'],
  },
  {
    domain: 'beta.net',
    registrar: 'Namecheap',
    status: 'clientHold',
    created_at: '2021-01-01T00:00:00Z',
    expires_at: '2027-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    nameservers: ['ns1.namecheap.com'],
  },
  {
    domain: 'gamma.org',
    registrar: 'Tucows',
    status: 'pendingTransfer',
    created_at: '2022-01-01T00:00:00Z',
    expires_at: '2027-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    nameservers: [],
  },
]

function withSetup() {
  let result: ReturnType<typeof useDomains>
  const wrapper = mount(
    defineComponent({
      setup() {
        result = useDomains()
        return () => h('div')
      },
    }),
  )
  return { result: result!, wrapper }
}

beforeEach(() => {
  vi.resetAllMocks()
})

describe('useDomains', () => {
  describe('initial state', () => {
    it('starts with empty domains and no error, loading immediately on mount', () => {
      mockFetch.mockResolvedValue([])
      const { result } = withSetup()
      expect(result.domains.value).toEqual([])
      expect(result.loading.value).toBe(true) // onMounted triggers loadDomains synchronously
      expect(result.error.value).toBeNull()
    })

    it('starts with empty filter refs', () => {
      mockFetch.mockResolvedValue([])
      const { result } = withSetup()
      expect(result.searchQuery.value).toBe('')
      expect(result.selectedRegistrar.value).toBe('')
      expect(result.selectedStatus.value).toBe('')
    })
  })

  describe('loadDomains', () => {
    it('sets loading true while fetching then false after', async () => {
      let resolve!: (v: Domain[]) => void
      mockFetch.mockReturnValue(new Promise((r) => (resolve = r)))

      const { result } = withSetup()
      expect(result.loading.value).toBe(true)

      resolve(FIXTURE)
      await nextTick()
      await nextTick()
      expect(result.loading.value).toBe(false)
    })

    it('populates domains on success', async () => {
      mockFetch.mockResolvedValue(FIXTURE)
      const { result } = withSetup()
      await nextTick()
      await nextTick()
      expect(result.domains.value).toHaveLength(3)
    })

    it('sets error and clears domains on failure', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'))
      const { result } = withSetup()
      await nextTick()
      await nextTick()
      expect(result.error.value).toBe('Network error')
      expect(result.loading.value).toBe(false)
    })

    it('resets error before each load attempt', async () => {
      mockFetch.mockRejectedValueOnce(new Error('First error'))
      mockFetch.mockResolvedValueOnce(FIXTURE)

      const { result } = withSetup()
      await nextTick()
      await nextTick()
      expect(result.error.value).toBe('First error')

      await result.loadDomains()
      expect(result.error.value).toBeNull()
    })
  })

  describe('filteredDomains', () => {
    async function setupWithData() {
      mockFetch.mockResolvedValue(FIXTURE)
      const setup = withSetup()
      await nextTick()
      await nextTick()
      return setup
    }

    it('returns all domains when no filters active', async () => {
      const { result } = await setupWithData()
      expect(result.filteredDomains.value).toHaveLength(3)
    })

    it('filters by search query (case-insensitive substring)', async () => {
      const { result } = await setupWithData()
      result.searchQuery.value = 'ALPHA'
      await nextTick()
      expect(result.filteredDomains.value).toHaveLength(1)
      expect(result.filteredDomains.value[0]?.domain).toBe('alpha.com')
    })

    it('filters by registrar exact match', async () => {
      const { result } = await setupWithData()
      result.selectedRegistrar.value = 'Tucows'
      await nextTick()
      expect(result.filteredDomains.value).toHaveLength(2)
      expect(result.filteredDomains.value.every((d) => d.registrar === 'Tucows')).toBe(true)
    })

    it('filters by status exact match', async () => {
      const { result } = await setupWithData()
      result.selectedStatus.value = 'clientHold'
      await nextTick()
      expect(result.filteredDomains.value).toHaveLength(1)
      expect(result.filteredDomains.value[0]?.status).toBe('clientHold')
    })

    it('combines all three filters (intersection)', async () => {
      const { result } = await setupWithData()
      result.searchQuery.value = 'alpha'
      result.selectedRegistrar.value = 'Tucows'
      result.selectedStatus.value = 'active'
      await nextTick()
      expect(result.filteredDomains.value).toHaveLength(1)
    })

    it('returns empty array when no domains match', async () => {
      const { result } = await setupWithData()
      result.searchQuery.value = 'zzznomatch'
      await nextTick()
      expect(result.filteredDomains.value).toHaveLength(0)
    })
  })

  describe('registrarOptions', () => {
    it('returns sorted unique registrars, excluding null/undefined', async () => {
      mockFetch.mockResolvedValue([
        ...FIXTURE,
        {
          domain: 'delta.io',
          registrar: null,
          status: 'active',
          created_at: null,
          expires_at: null,
          updated_at: null,
          nameservers: null,
        },
      ])
      const { result } = withSetup()
      await nextTick()
      await nextTick()
      expect(result.registrarOptions.value).toEqual(['Namecheap', 'Tucows'])
    })
  })

  describe('clearFilters', () => {
    it('resets all filter refs to empty strings', async () => {
      mockFetch.mockResolvedValue(FIXTURE)
      const { result } = withSetup()
      await nextTick()
      await nextTick()

      result.searchQuery.value = 'alpha'
      result.selectedRegistrar.value = 'Tucows'
      result.selectedStatus.value = 'active'

      result.clearFilters()

      expect(result.searchQuery.value).toBe('')
      expect(result.selectedRegistrar.value).toBe('')
      expect(result.selectedStatus.value).toBe('')
    })
  })
})
