import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import BidModal from './BidModal.vue'

describe('BidModal.vue', () => {
  let wrapper

  const mountModal = (props = {}) => {
    return mount(BidModal, {
      props: {
        show: true,
        loading: false,
        aucation: {
          current_bid: 1000000,
          start_bid: 500000,
        },
        ...props,
      },
    })
  }

  beforeEach(() => {
    wrapper = mountModal()
  })

  it('menampilkan modal ketika show bernilai true', () => {
    expect(wrapper.find('form').exists()).toBe(true)
    expect(wrapper.text()).toContain('Ajukan Penawaran')
    expect(wrapper.text()).toContain('Harga saat ini:')
  })

  it('tidak menampilkan modal ketika show bernilai false', async () => {
    await wrapper.setProps({ show: false })

    expect(wrapper.find('form').exists()).toBe(false)
  })

  it('menggunakan start_bid jika current_bid tidak tersedia', async () => {
    await wrapper.setProps({
      aucation: { start_bid: 750000 },
    })

    expect(wrapper.text()).toContain('750.000')
  })

  it('menggunakan nol jika current_bid dan start_bid tidak tersedia', async () => {
    await wrapper.setProps({
      aucation: {},
    })

    expect(wrapper.text()).toContain('Rp0')
  })

  it('mereset nominal dan error saat modal dibuka kembali', async () => {
    await wrapper.find('input').setValue('500000')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.find('[role="alert"]').exists()).toBe(true)

    await wrapper.setProps({ show: false })
    await wrapper.setProps({ show: true })

    expect(wrapper.find('input').element.value).toBe('')
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
  })

  it('menolak penawaran yang lebih rendah dari harga saat ini', async () => {
    await wrapper.find('input').setValue('500000')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.find('[role="alert"]').exists()).toBe(true)
    expect(wrapper.text()).toContain(
      'Penawaran harus lebih tinggi dari Rp1.000.000.',
    )
    expect(wrapper.emitted('submit')).toBeUndefined()
  })

  it('menolak penawaran yang sama dengan harga saat ini', async () => {
    await wrapper.find('input').setValue('1000000')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.find('[role="alert"]').exists()).toBe(true)
    expect(wrapper.emitted('submit')).toBeUndefined()
  })

  it('menolak nominal nol', async () => {
    await wrapper.find('input').setValue('0')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.find('[role="alert"]').exists()).toBe(true)
    expect(wrapper.emitted('submit')).toBeUndefined()
  })

  it('mengirim penawaran valid sebagai angka', async () => {
    await wrapper.find('input').setValue('1500000')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(wrapper.emitted('submit')).toEqual([
      [{ bid: 1500000 }],
    ])
  })

  it('menghapus error setelah penawaran valid dikirim', async () => {
    await wrapper.find('input').setValue('1000000')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.find('[role="alert"]').exists()).toBe(true)

    await wrapper.find('input').setValue('1500000')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(wrapper.emitted('submit')).toHaveLength(1)
  })

  it('menampilkan status Mengirim ketika loading', async () => {
    await wrapper.setProps({ loading: true })

    expect(wrapper.text()).toContain('Mengirim...')
    expect(wrapper.find('button[type="submit"]').element.disabled).toBe(true)
  })

  it('tidak menutup modal melalui tombol Tutup ketika loading', async () => {
    await wrapper.setProps({ loading: true })
    await wrapper.find('button[aria-label="Tutup"]').trigger('click')

    expect(wrapper.emitted('close')).toBeUndefined()
  })

  it('menutup modal melalui tombol Tutup ketika tidak loading', async () => {
    await wrapper.find('button[aria-label="Tutup"]').trigger('click')

    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('menutup modal melalui tombol Batal ketika tidak loading', async () => {
    const cancelButton = wrapper
      .findAll('button')
      .find((button) => button.text() === 'Batal')

    await cancelButton.trigger('click')

    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('menutup modal ketika area luar diklik', async () => {
    const overlay = wrapper.find('.fixed.inset-0')

    const event = new MouseEvent('click', {
      bubbles: true,
    })

    overlay.element.dispatchEvent(event)

    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('tidak menutup modal ketika area luar diklik saat loading', async () => {
    await wrapper.setProps({ loading: true })

    const overlay = wrapper.find('.fixed.inset-0')

    const event = new MouseEvent('click', {
      bubbles: true,
    })

    overlay.element.dispatchEvent(event)

    expect(wrapper.emitted('close')).toBeUndefined()
  })

  it('tidak menutup modal ketika bagian form diklik', async () => {
    await wrapper.find('form').trigger('click')

    expect(wrapper.emitted('close')).toBeUndefined()
  })

  it('menggunakan nilai default ketika aucation bernilai null', async () => {
    await wrapper.setProps({ aucation: null })

    expect(wrapper.text()).toContain('Rp0')
  })

  it('membandingkan dengan start_bid saat submit jika current_bid tidak tersedia', async () => {
    await wrapper.setProps({ aucation: { start_bid: 750000 } })
    await wrapper.find('input').setValue('700000')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.text()).toContain(
      'Penawaran harus lebih tinggi dari Rp750.000.',
    )
    expect(wrapper.emitted('submit')).toBeUndefined()
  })

  it('membandingkan dengan nol saat submit jika current_bid dan start_bid tidak tersedia', async () => {
    await wrapper.setProps({ aucation: {} })
    await wrapper.find('input').setValue('0')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.text()).toContain('Penawaran harus lebih tinggi dari Rp0.')
    expect(wrapper.emitted('submit')).toBeUndefined()

    await wrapper.find('input').setValue('1000')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('submit')[0]).toEqual([{ bid: 1000 }])
  })
})