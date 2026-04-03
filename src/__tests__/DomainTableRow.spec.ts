import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DomainTableRow from '../components/DomainTableRow.vue'
import type { Domain } from '../types/domain'

const BASE: Domain = {
  domain: 'example.com',
  registrar: 'Tucows',
  status: 'active',
  created_at: '2020-01-01T00:00:00Z',
  expires_at: '2027-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  nameservers: ['ns1.tucows.com'],
}

function mountRow(domain: Domain) {
  return mount(DomainTableRow, { props: { domain }, attachTo: document.body })
}

describe('DomainTableRow', () => {
  it('renders all six cells', () => {
    const wrapper = mountRow(BASE)
    expect(wrapper.findAll('td')).toHaveLength(6)
  })

  it('renders — for null registrar', () => {
    const wrapper = mountRow({ ...BASE, registrar: null })
    expect(wrapper.findAll('td')[1]!.text()).toBe('—')
  })

  it('renders — for null dates', () => {
    const wrapper = mountRow({ ...BASE, created_at: null, expires_at: null, updated_at: null })
    const cells = wrapper.findAll('td')
    expect(cells[3]!.text()).toBe('—')
    expect(cells[4]!.text()).toBe('—')
    expect(cells[5]!.text()).toBe('—')
  })

  it('applies domain-row--expired class for a past expiry date', () => {
    const wrapper = mountRow({ ...BASE, expires_at: '2020-01-01T00:00:00Z' })
    expect(wrapper.classes()).toContain('domain-row--expired')
  })

  it('applies domain-row--expires-soon class when expiry is within 30 days', () => {
    const soon = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString()
    const wrapper = mountRow({ ...BASE, expires_at: soon })
    expect(wrapper.classes()).toContain('domain-row--expires-soon')
  })

  it('applies no expiry class for a far-future expiry date', () => {
    const wrapper = mountRow(BASE)
    expect(wrapper.classes()).not.toContain('domain-row--expired')
    expect(wrapper.classes()).not.toContain('domain-row--expires-soon')
  })

  it('emits select with the domain when clicked', async () => {
    const wrapper = mountRow(BASE)
    await wrapper.trigger('click')
    expect(wrapper.emitted('select')).toHaveLength(1)
    expect(wrapper.emitted('select')![0]).toEqual([BASE])
  })

  it('emits select when Enter is pressed', async () => {
    const wrapper = mountRow(BASE)
    await wrapper.trigger('keydown.enter')
    expect(wrapper.emitted('select')).toHaveLength(1)
  })

  it('emits select when Space is pressed', async () => {
    const wrapper = mountRow(BASE)
    await wrapper.trigger('keydown.space')
    expect(wrapper.emitted('select')).toHaveLength(1)
  })
})
