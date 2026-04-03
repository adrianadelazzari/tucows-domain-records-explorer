import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StatusBadge from '../components/StatusBadge.vue'

describe('StatusBadge', () => {
  it('renders "Active" label for active status', () => {
    const wrapper = mount(StatusBadge, { props: { status: 'active' } })
    expect(wrapper.text()).toBe('Active')
  })

  it('renders "Client Hold" label for clientHold status', () => {
    const wrapper = mount(StatusBadge, { props: { status: 'clientHold' } })
    expect(wrapper.text()).toBe('Client Hold')
  })

  it('renders "Pending Transfer" label for pendingTransfer status', () => {
    const wrapper = mount(StatusBadge, { props: { status: 'pendingTransfer' } })
    expect(wrapper.text()).toBe('Pending Transfer')
  })

  it('applies badge--active class for active status', () => {
    const wrapper = mount(StatusBadge, { props: { status: 'active' } })
    expect(wrapper.find('.badge').classes()).toContain('badge--active')
  })

  it('applies badge--clientHold class for clientHold status', () => {
    const wrapper = mount(StatusBadge, { props: { status: 'clientHold' } })
    expect(wrapper.find('.badge').classes()).toContain('badge--clientHold')
  })

  it('applies badge--pendingTransfer class for pendingTransfer status', () => {
    const wrapper = mount(StatusBadge, { props: { status: 'pendingTransfer' } })
    expect(wrapper.find('.badge').classes()).toContain('badge--pendingTransfer')
  })
})
