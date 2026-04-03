import { describe, it, expect, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import DomainDetail from '../components/DomainDetail.vue'
import type { Domain } from '../types/domain'

const FIXTURE: Domain = {
  domain: 'example.com',
  registrar: 'Tucows',
  status: 'active',
  created_at: '2019-06-15T00:00:00Z',
  expires_at: '2027-06-15T00:00:00Z',
  updated_at: '2024-06-15T00:00:00Z',
  nameservers: ['ns1.tucows.com', 'ns2.tucows.com'],
}

function mountDetail(props: { domain: Domain | null; open: boolean }) {
  return mount(DomainDetail, {
    props,
    attachTo: document.body,
  })
}

afterEach(() => {
  document.body.innerHTML = ''
  document.body.style.overflow = ''
})

describe('DomainDetail', () => {
  describe('when closed', () => {
    it('does not render the modal', () => {
      const wrapper = mountDetail({ domain: FIXTURE, open: false })
      expect(document.body.querySelector('.modal')).toBeNull()
      wrapper.unmount()
    })

    it('does not render the overlay', () => {
      const wrapper = mountDetail({ domain: FIXTURE, open: false })
      expect(document.body.querySelector('.overlay')).toBeNull()
      wrapper.unmount()
    })
  })

  describe('when open', () => {
    it('renders the modal', () => {
      const wrapper = mountDetail({ domain: FIXTURE, open: true })
      expect(document.body.querySelector('.modal')).not.toBeNull()
      wrapper.unmount()
    })

    it('renders the domain name in the header', () => {
      const wrapper = mountDetail({ domain: FIXTURE, open: true })
      expect(document.body.querySelector('.modal__title')?.textContent).toContain('example.com')
      wrapper.unmount()
    })

    it('renders the registrar', () => {
      const wrapper = mountDetail({ domain: FIXTURE, open: true })
      expect(document.body.querySelector('.modal__body')?.textContent).toContain('Tucows')
      wrapper.unmount()
    })

    it('renders all nameservers', () => {
      const wrapper = mountDetail({ domain: FIXTURE, open: true })
      const items = document.body.querySelectorAll('.nameserver-list__item')
      expect(items).toHaveLength(2)
      expect(items[0]?.textContent?.trim()).toBe('ns1.tucows.com')
      expect(items[1]?.textContent?.trim()).toBe('ns2.tucows.com')
      wrapper.unmount()
    })

    it('renders — when nameservers is null', () => {
      const wrapper = mountDetail({
        domain: { ...FIXTURE, nameservers: null },
        open: true,
      })
      expect(document.body.querySelector('.nameserver-list')).toBeNull()
      wrapper.unmount()
    })

    it('renders an "Expired" tag for a past expiry date', () => {
      const wrapper = mountDetail({
        domain: { ...FIXTURE, expires_at: '2020-01-01T00:00:00Z' },
        open: true,
      })
      expect(document.body.querySelector('.detail-list__tag--expired')?.textContent?.trim()).toBe(
        'Expired',
      )
      wrapper.unmount()
    })

    it('shows aria-label with the domain name', () => {
      const wrapper = mountDetail({ domain: FIXTURE, open: true })
      const modal = document.body.querySelector('.modal')
      expect(modal?.getAttribute('aria-label')).toContain('example.com')
      wrapper.unmount()
    })
  })

  describe('interactions', () => {
    it('emits close when the close button is clicked', async () => {
      const wrapper = mountDetail({ domain: FIXTURE, open: true })
      const closeBtn = document.body.querySelector<HTMLButtonElement>('.modal__close')
      closeBtn?.click()
      await wrapper.vm.$nextTick()
      expect(wrapper.emitted('close')).toBeTruthy()
      wrapper.unmount()
    })

    it('emits close when Escape key is pressed', async () => {
      const wrapper = mountDetail({ domain: FIXTURE, open: true })
      const modal = document.body.querySelector<HTMLElement>('.modal')
      modal?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
      await wrapper.vm.$nextTick()
      expect(wrapper.emitted('close')).toBeTruthy()
      wrapper.unmount()
    })

    it('emits close when overlay is clicked', async () => {
      const wrapper = mountDetail({ domain: FIXTURE, open: true })
      const overlay = document.body.querySelector<HTMLElement>('.overlay')
      overlay?.click()
      await wrapper.vm.$nextTick()
      expect(wrapper.emitted('close')).toBeTruthy()
      wrapper.unmount()
    })
  })
})
