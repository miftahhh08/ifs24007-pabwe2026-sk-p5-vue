import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import BidModal from './BidModal.vue'

const mountModal = (props = {}) =>
  mount(BidModal, { props: { show: true, currentBid: 1000, ...props } })

describe('BidModal', () => {
  it('tidak tampil saat show=false', () => {
    expect(mountModal({ show: false }).find('form').exists()).toBe(false)
  })

  it('menampilkan tawaran tertinggi saat ini', () => {
    expect(mountModal().text()).toContain('Rp')
    expect(mountModal().text()).toContain('1.000')
  })

  it('menolak bid yang tidak lebih tinggi', async () => {
    const wrapper = mountModal()
    await wrapper.find('input').setValue('1000')
    await wrapper.find('form').trigger('submit')
    expect(wrapper.find('[role="alert"]').text()).toContain('lebih tinggi')
    expect(wrapper.emitted('submit')).toBeUndefined()
  })

  it('menolak input kosong/bukan angka valid', async () => {
    const wrapper = mountModal()
    await wrapper.find('form').trigger('submit')
    expect(wrapper.find('[role="alert"]').exists()).toBe(true)
  })

  it('mengirim bid yang valid dan menghapus error sebelumnya', async () => {
    const wrapper = mountModal()
    await wrapper.find('form').trigger('submit')
    await wrapper.find('input').setValue('1500')
    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('submit')[0][0]).toEqual({ bid: 1500 })
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
  })

  it('mereset input saat dibuka kembali', async () => {
    const wrapper = mountModal({ show: false })
    await wrapper.setProps({ show: true })
    await wrapper.find('input').setValue('5')
    await wrapper.setProps({ show: false })
    await wrapper.setProps({ show: true })
    expect(wrapper.find('input').element.value).toBe('')
  })

  it('menutup modal kecuali saat loading', async () => {
    const wrapper = mountModal()
    await wrapper.find('button[aria-label="Tutup"]').trigger('click')
    await wrapper.find('.fixed').trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(2)
    await wrapper.setProps({ loading: true })
    await wrapper.find('.fixed').trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(2)
    expect(wrapper.find('button[type="submit"]').text()).toBe('Mengirim...')
  })
})
