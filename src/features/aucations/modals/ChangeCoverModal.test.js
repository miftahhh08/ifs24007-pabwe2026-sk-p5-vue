import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ChangeCoverModal from './ChangeCoverModal.vue'

const mountModal = (props = {}) =>
  mount(ChangeCoverModal, { props: { show: true, ...props } })

async function pick(wrapper, file) {
  const input = wrapper.find('input[type="file"]')
  Object.defineProperty(input.element, 'files', {
    value: file ? [file] : [],
    configurable: true,
  })
  await input.trigger('change')
}

describe('ChangeCoverModal', () => {
  beforeEach(() => {
    URL.createObjectURL = vi.fn(() => 'blob:preview')
    URL.revokeObjectURL = vi.fn()
  })

  it('tidak tampil saat show=false', () => {
    expect(mountModal({ show: false }).find('form').exists()).toBe(false)
  })

  it('menampilkan pratinjau dan mengirim file', async () => {
    const wrapper = mountModal()
    const file = new File(['x'], 'a.png', { type: 'image/png' })
    await pick(wrapper, file)
    expect(wrapper.find('img').attributes('src')).toBe('blob:preview')

    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('submit')[0][0]).toBe(file)
  })

  it('menolak file bukan gambar', async () => {
    const wrapper = mountModal()
    await pick(wrapper, new File(['x'], 'a.txt', { type: 'text/plain' }))
    expect(wrapper.find('[role="alert"]').text()).toContain('gambar')
    expect(wrapper.find('img').exists()).toBe(false)
  })

  it('meminta file bila belum dipilih', async () => {
    const wrapper = mountModal()
    await wrapper.find('form').trigger('submit')
    expect(wrapper.find('[role="alert"]').text()).toContain('Pilih gambar')
    await pick(wrapper, null)
    expect(wrapper.find('img').exists()).toBe(false)
  })

  it('membersihkan pratinjau saat modal ditutup atau di-unmount', async () => {
    const wrapper = mountModal()
    await pick(wrapper, new File(['x'], 'a.png', { type: 'image/png' }))
    await wrapper.setProps({ show: false })
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:preview')

    await wrapper.setProps({ show: true })
    await pick(wrapper, new File(['x'], 'b.png', { type: 'image/png' }))
    wrapper.unmount()
    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(2)
  })

  it('menutup modal kecuali saat loading', async () => {
    const wrapper = mountModal()
    await wrapper.find('button[aria-label="Tutup"]').trigger('click')
    await wrapper.find('.fixed').trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(2)
    await wrapper.setProps({ loading: true })
    await wrapper.find('.fixed').trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(2)
    expect(wrapper.find('button[type="submit"]').text()).toBe('Mengunggah...')
  })
})
