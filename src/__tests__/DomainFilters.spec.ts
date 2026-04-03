import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DomainFilters from '../components/DomainFilters.vue'

const REGISTRAR_OPTIONS = ['Cloudflare Registrar', 'GoDaddy', 'Namecheap', 'Tucows']

function mountFilters(modelOverrides = {}) {
  return mount(DomainFilters, {
    props: {
      registrarOptions: REGISTRAR_OPTIONS,
      search: '',
      registrar: '',
      status: '',
      ...modelOverrides,
    },
  })
}

describe('DomainFilters', () => {
  it('renders a search input', () => {
    const wrapper = mountFilters()
    expect(wrapper.find('input[type="search"]').exists()).toBe(true)
  })

  it('renders a registrar select', () => {
    const wrapper = mountFilters()
    expect(wrapper.find('#filter-registrar').exists()).toBe(true)
  })

  it('renders a status select', () => {
    const wrapper = mountFilters()
    expect(wrapper.find('#filter-status').exists()).toBe(true)
  })

  it('renders all registrar options plus the default', () => {
    const wrapper = mountFilters()
    const options = wrapper.find('#filter-registrar').findAll('option')
    expect(options).toHaveLength(REGISTRAR_OPTIONS.length + 1) // +1 for "All registrars"
    expect(options[0]?.text()).toBe('All registrars')
    expect(options.map((o) => o.text())).toContain('Tucows')
  })

  it('renders all status options', () => {
    const wrapper = mountFilters()
    const options = wrapper.find('#filter-status').findAll('option')
    const labels = options.map((o) => o.text())
    expect(labels).toContain('All statuses')
    expect(labels).toContain('Active')
    expect(labels).toContain('Client Hold')
    expect(labels).toContain('Pending Transfer')
  })

  it('emits update:search when search input changes', async () => {
    const wrapper = mountFilters()
    await wrapper.find('input[type="search"]').setValue('example')
    expect(wrapper.emitted('update:search')).toBeTruthy()
    expect(wrapper.emitted('update:search')?.[0]).toEqual(['example'])
  })

  it('emits update:registrar when registrar select changes', async () => {
    const wrapper = mountFilters()
    await wrapper.find('#filter-registrar').setValue('Tucows')
    expect(wrapper.emitted('update:registrar')?.[0]).toEqual(['Tucows'])
  })

  it('emits update:status when status select changes', async () => {
    const wrapper = mountFilters()
    await wrapper.find('#filter-status').setValue('active')
    expect(wrapper.emitted('update:status')?.[0]).toEqual(['active'])
  })

  it('emits clear when Clear filters button is clicked', async () => {
    const wrapper = mountFilters()
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('clear')).toBeTruthy()
  })

  it('reflects the search model value in the input', () => {
    const wrapper = mountFilters({ search: 'mystore' })
    const input = wrapper.find<HTMLInputElement>('input[type="search"]').element
    expect(input.value).toBe('mystore')
  })
})
