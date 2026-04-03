import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DomainTable from '../components/DomainTable.vue'
import type { Domain } from '../types/domain'

const FIXTURE: Domain[] = [
  {
    domain: 'charlie.com',
    registrar: 'GoDaddy',
    status: 'active',
    created_at: '2020-01-01T00:00:00Z',
    expires_at: '2027-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    nameservers: ['ns1.godaddy.com'],
  },
  {
    domain: 'alpha.com',
    registrar: 'Tucows',
    status: 'clientHold',
    created_at: '2019-01-01T00:00:00Z',
    expires_at: '2026-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    nameservers: ['ns1.tucows.com'],
  },
  {
    domain: 'beta.net',
    registrar: 'Namecheap',
    status: 'pendingTransfer',
    created_at: '2021-01-01T00:00:00Z',
    expires_at: '2028-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    nameservers: ['ns1.namecheap.com'],
  },
]

describe('DomainTable', () => {
  it('renders one row per domain', () => {
    const wrapper = mount(DomainTable, { props: { domains: FIXTURE } })
    expect(wrapper.findAll('tbody tr')).toHaveLength(3)
  })

  it('renders six column headers', () => {
    const wrapper = mount(DomainTable, { props: { domains: FIXTURE } })
    expect(wrapper.findAll('thead th')).toHaveLength(6)
  })

  it('renders domains sorted by domain name ascending by default', () => {
    const wrapper = mount(DomainTable, { props: { domains: FIXTURE } })
    const rows = wrapper.findAll('tbody tr')
    expect(rows[0]?.text()).toContain('alpha.com')
    expect(rows[1]?.text()).toContain('beta.net')
    expect(rows[2]?.text()).toContain('charlie.com')
  })

  it('toggles sort to descending when the active header is clicked', async () => {
    const wrapper = mount(DomainTable, { props: { domains: FIXTURE } })
    const domainHeader = wrapper.findAll('thead th')[0]!
    await domainHeader.trigger('click')
    const rows = wrapper.findAll('tbody tr')
    expect(rows[0]?.text()).toContain('charlie.com')
    expect(rows[2]?.text()).toContain('alpha.com')
  })

  it('sorts by a new column ascending when a different header is clicked', async () => {
    const wrapper = mount(DomainTable, { props: { domains: FIXTURE } })
    const registrarHeader = wrapper.findAll('thead th')[1]!
    await registrarHeader.trigger('click')
    const rows = wrapper.findAll('tbody tr')
    expect(rows[0]?.text()).toContain('GoDaddy')
    expect(rows[1]?.text()).toContain('Namecheap')
    expect(rows[2]?.text()).toContain('Tucows')
  })

  it('sets aria-sort="ascending" on the active column', async () => {
    const wrapper = mount(DomainTable, { props: { domains: FIXTURE } })
    const domainHeader = wrapper.findAll('thead th')[0]!
    expect(domainHeader.attributes('aria-sort')).toBe('ascending')
  })

  it('sets aria-sort="descending" after clicking the active header', async () => {
    const wrapper = mount(DomainTable, { props: { domains: FIXTURE } })
    const domainHeader = wrapper.findAll('thead th')[0]!
    await domainHeader.trigger('click')
    expect(domainHeader.attributes('aria-sort')).toBe('descending')
  })

  it('sets aria-sort="none" on inactive columns', () => {
    const wrapper = mount(DomainTable, { props: { domains: FIXTURE } })
    const registrarHeader = wrapper.findAll('thead th')[1]!
    expect(registrarHeader.attributes('aria-sort')).toBe('none')
  })

  it('emits select with the correct domain when a row is clicked', async () => {
    const wrapper = mount(DomainTable, { props: { domains: FIXTURE } })
    await wrapper.findAll('tbody tr')[0]!.trigger('click')
    const emitted = wrapper.emitted('select')
    expect(emitted).toBeTruthy()
    expect((emitted![0] as Domain[])[0]?.domain).toBe('alpha.com')
  })

  it('renders an empty tbody when domains array is empty', () => {
    const wrapper = mount(DomainTable, { props: { domains: [] } })
    expect(wrapper.findAll('tbody tr')).toHaveLength(0)
  })
})
