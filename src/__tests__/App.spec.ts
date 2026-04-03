import { describe, it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { nextTick } from 'vue'
import App from '../App.vue'

vi.mock('../services/domainService')

import { fetchDomains } from '../services/domainService'
const mockFetch = vi.mocked(fetchDomains)

describe('App', () => {
  it('renders the page heading', async () => {
    mockFetch.mockResolvedValue([])
    const wrapper = mount(App)
    expect(wrapper.find('h1').text()).toBe('Domain Records Explorer')
  })

  it('renders the filters bar', async () => {
    mockFetch.mockResolvedValue([])
    const wrapper = mount(App)
    expect(wrapper.find('#filter-search').exists()).toBe(true)
    expect(wrapper.find('#filter-registrar').exists()).toBe(true)
    expect(wrapper.find('#filter-status').exists()).toBe(true)
  })

  it('shows the loading spinner while fetching', async () => {
    mockFetch.mockReturnValue(new Promise(() => {}))
    const wrapper = mount(App)
    await nextTick()
    expect(wrapper.find('[role="status"]').exists()).toBe(true)
    expect(wrapper.find('table').exists()).toBe(false)
  })

  it('shows the error empty state when fetch fails', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'))
    const wrapper = mount(App)
    await flushPromises()
    expect(wrapper.find('[role="alert"]').exists()).toBe(true)
    expect(wrapper.find('table').exists()).toBe(false)
  })

  it('shows the empty state when fetch returns no domains', async () => {
    mockFetch.mockResolvedValue([])
    const wrapper = mount(App)
    await flushPromises()
    expect(wrapper.text()).toContain('No domains yet')
    expect(wrapper.find('table').exists()).toBe(false)
  })

  it('renders the table after a successful fetch', async () => {
    mockFetch.mockResolvedValue([
      {
        domain: 'example.com',
        registrar: 'Tucows',
        status: 'active',
        created_at: '2020-01-01T00:00:00Z',
        expires_at: '2027-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        nameservers: ['ns1.tucows.com'],
      },
    ])
    const wrapper = mount(App)
    await flushPromises()
    expect(wrapper.find('table').exists()).toBe(true)
    expect(wrapper.findAll('tbody tr')).toHaveLength(1)
  })
})
