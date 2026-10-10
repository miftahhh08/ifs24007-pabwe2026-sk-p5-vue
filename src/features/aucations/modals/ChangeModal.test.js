import { describe, it, expect } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { nextTick } from 'vue'
import ChangeModal from './ChangeModal.vue'

const item = {
  id: 1,
  title: 'Laptop Bekas',
  description: 'Laptop masih bagus',
  start_bid: 1500000,
  closed_at: '2026-12-31T18:30:00',
}

function mountModal(props = {}) {
  return mount(ChangeModal, {
    props: { show: true, ...props },
    global: {
      stubs: {
        MarkdownEditor: {
          props: ['modelValue', 'label', 'rows', 'placeholder', 'disabled'],
          emits: ['update:modelValue'],
          template: `
            <textarea
              data-testid="description"
              :value="modelValue"
              @input="$emit('update:modelValue', $event.target.value)"
            />
          `,
        },
      },
    },
  })
}

describe('ChangeModal.vue', () => {
  it('tidak menampilkan modal jika show false', () => {
    const wrapper = mountModal({ show: false, aucation: item })
    expect(wrapper.find('form').exists()).toBe(false)
  })

  it('menampilkan judul modal', () => {
    const wrapper = mountModal({ aucation: item })
    expect(wrapper.text()).toContain('Ubah Data Lelang')
  })

  it('mengisi form dari data lelang', () => {
    const wrapper = mountModal({ aucation: item })
    const inputs = wrapper.findAll('input')

    expect(inputs[0].element.value).toBe('Laptop Bekas')
    expect(wrapper.find('[data-testid="description"]').element.value)
      .toBe('Laptop masih bagus')
    expect(inputs[1].element.value).toBe('1500000')
    expect(inputs[2].element.value).toBe('2026-12-31T18:30')
  })

  it('mengisi form kosong jika aucation null', () => {
    const wrapper = mountModal({ aucation: null })
    const inputs = wrapper.findAll('input')

    expect(inputs[0].element.value).toBe('')
    expect(wrapper.find('[data-testid="description"]').element.value).toBe('')
    expect(inputs[1].element.value).toBe('')
    expect(inputs[2].element.value).toBe('')
  })

  it('memperbarui form ketika data lelang berubah', async () => {
    const wrapper = mountModal({ aucation: item })
    await wrapper.setProps({
      aucation: { ...item, title: 'Kamera', start_bid: 500000 },
    })

    expect(wrapper.findAll('input')[0].element.value).toBe('Kamera')
    expect(wrapper.findAll('input')[1].element.value).toBe('500000')
  })

  it('mengisi ulang form ketika modal dibuka', async () => {
    const wrapper = mountModal({ aucation: item })
    await wrapper.findAll('input')[0].setValue('Judul sementara')
    await wrapper.setProps({ show: false })
    await wrapper.setProps({
      show: true,
      aucation: { ...item, title: 'Judul terbaru' },
    })

    expect(wrapper.findAll('input')[0].element.value).toBe('Judul terbaru')
  })

  it('tidak submit jika nama barang kosong', async () => {
    const wrapper = mountModal({ aucation: { ...item, title: '   ' } })
    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('submit')).toBeUndefined()
  })

  it('tidak submit jika deskripsi kosong', async () => {
    const wrapper = mountModal({ aucation: { ...item, description: '   ' } })
    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('submit')).toBeUndefined()
  })

  it('tidak submit jika harga awal nol', async () => {
    const wrapper = mountModal({ aucation: { ...item, start_bid: 0 } })
    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('submit')).toBeUndefined()
  })

  it('tidak submit jika harga awal negatif', async () => {
    const wrapper = mountModal({ aucation: { ...item, start_bid: -100 } })
    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('submit')).toBeUndefined()
  })

  it('tidak submit jika waktu penutupan kosong', async () => {
    const wrapper = mountModal({ aucation: { ...item, closed_at: '' } })
    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('submit')).toBeUndefined()
  })

  it('submit dengan data yang sudah dibersihkan dan harga berupa angka', async () => {
    const wrapper = mountModal({ aucation: item })
    await wrapper.findAll('input')[0].setValue('  Kamera  ')
    await wrapper.find('[data-testid="description"]').setValue('  Kamera bagus  ')
    await wrapper.findAll('input')[1].setValue('2500000')
    await wrapper.findAll('input')[2].setValue('2026-12-31T18:30')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('submit')?.[0]?.[0]).toEqual({
      title: 'Kamera',
      description: 'Kamera bagus',
      start_bid: 2500000,
      closed_at: '2026-12-31T18:30',
    })
  })

  it('menampilkan teks menyimpan saat loading', () => {
    const wrapper = mountModal({ loading: true, aucation: item })
    expect(wrapper.text()).toContain('Menyimpan...')
    expect(wrapper.find('button[type="submit"]').element.disabled).toBe(true)
  })

  it('tidak menutup modal saat loading', async () => {
    const wrapper = mountModal({ loading: true, aucation: item })
    await wrapper.find('button[aria-label="Tutup"]').trigger('click')
    await wrapper.find('button[type="button"]:not([aria-label])').trigger('click')

    expect(wrapper.emitted('close')).toBeUndefined()
  })

  it('menutup modal saat tombol tutup diklik jika tidak loading', async () => {
    const wrapper = mountModal({ loading: false, aucation: item })
    await wrapper.find('button[aria-label="Tutup"]').trigger('click')

    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('menutup modal ketika area luar diklik', async () => {
    const wrapper = mountModal({ loading: false, aucation: item })
    await wrapper.find('.fixed.inset-0').element.click()

    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('tidak menutup modal ketika form diklik', async () => {
    const wrapper = mountModal({ aucation: item })
    await wrapper.find('form').trigger('click')
    expect(wrapper.emitted('close')).toBeUndefined()
  })
})

