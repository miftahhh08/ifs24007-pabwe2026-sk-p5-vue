import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import AddModal from './AddModal.vue'

describe('AddModal.vue', () => {
  it('tidak menampilkan modal ketika show false', () => {
    const wrapper = mount(AddModal)

    expect(wrapper.find('form').exists()).toBe(false)
  })

  it('menampilkan form ketika show true', () => {
    const wrapper = mount(AddModal, {
      props: { show: true },
    })

    expect(wrapper.text()).toContain('Buat Lelang')
    expect(wrapper.text()).toContain('Nama barang')
    expect(wrapper.text()).toContain('Harga awal (Rp)')
    expect(wrapper.text()).toContain('Waktu penutupan')
  })

  it('tidak mengirim submit jika semua field kosong', async () => {
    const wrapper = mount(AddModal, {
      props: { show: true },
    })

    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('submit')).toBeUndefined()
  })

  it('tidak mengirim submit jika judul hanya spasi', async () => {
    const wrapper = mount(AddModal, {
      props: { show: true },
    })

    const inputs = wrapper.findAll('input')
    await inputs[0].setValue('   ')
    await wrapper.findComponent({ name: 'MarkdownEditor' })
      .vm.$emit('update:modelValue', 'Deskripsi')
    await inputs[1].setValue('1000')
    await inputs[2].setValue('2027-01-01T12:00')

    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('submit')).toBeUndefined()
  })

  it('tidak mengirim submit jika deskripsi kosong', async () => {
    const wrapper = mount(AddModal, {
      props: { show: true },
    })

    const inputs = wrapper.findAll('input')
    await inputs[0].setValue('Barang')
    await inputs[1].setValue('1000')
    await inputs[2].setValue('2027-01-01T12:00')

    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('submit')).toBeUndefined()
  })

  it('tidak mengirim submit jika harga awal nol', async () => {
    const wrapper = mount(AddModal, {
      props: { show: true },
    })

    const inputs = wrapper.findAll('input')
    await inputs[0].setValue('Barang')
    await wrapper.findComponent({ name: 'MarkdownEditor' })
      .vm.$emit('update:modelValue', 'Deskripsi')
    await inputs[1].setValue('0')
    await inputs[2].setValue('2027-01-01T12:00')

    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('submit')).toBeUndefined()
  })

  it('tidak mengirim submit jika waktu penutupan kosong', async () => {
    const wrapper = mount(AddModal, {
      props: { show: true },
    })

    const inputs = wrapper.findAll('input')
    await inputs[0].setValue('Barang')
    await wrapper.findComponent({ name: 'MarkdownEditor' })
      .vm.$emit('update:modelValue', 'Deskripsi')
    await inputs[1].setValue('1000')

    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('submit')).toBeUndefined()
  })

  it('mengirim data yang sudah divalidasi dan dirapikan', async () => {
    const wrapper = mount(AddModal, {
      props: { show: true },
    })

    const inputs = wrapper.findAll('input')
    await inputs[0].setValue('  Barang antik  ')
    await wrapper.findComponent({ name: 'MarkdownEditor' })
      .vm.$emit('update:modelValue', '  Deskripsi barang  ')
    await inputs[1].setValue('2500')
    await inputs[2].setValue('2027-01-01T12:00')

    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('submit')).toEqual([[
      {
        title: 'Barang antik',
        description: 'Deskripsi barang',
        start_bid: 2500,
        closed_at: '2027-01-01T12:00',
      },
    ]])
  })

  it('menutup modal melalui tombol Tutup', async () => {
    const wrapper = mount(AddModal, {
      props: { show: true },
    })

    await wrapper.find('[aria-label="Tutup"]').trigger('click')

    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('menutup modal melalui tombol Batal', async () => {
    const wrapper = mount(AddModal, {
      props: { show: true },
    })

    const cancelButton = wrapper.findAll('button')
      .find((button) => button.text() === 'Batal')

    await cancelButton.trigger('click')

    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('tidak menutup modal melalui tombol saat loading', async () => {
    const wrapper = mount(AddModal, {
      props: { show: true, loading: true },
    })

    await wrapper.find('[aria-label="Tutup"]').trigger('click')
    const cancelButton = wrapper.findAll('button')
      .find((button) => button.text() === 'Batal')
    await cancelButton.trigger('click')

    expect(wrapper.emitted('close')).toBeUndefined()
  })

  it('menonaktifkan tombol submit dan menampilkan status loading', () => {
    const wrapper = mount(AddModal, {
      props: { show: true, loading: true },
    })

    const submitButton = wrapper.find('button[type="submit"]')

    expect(submitButton.element.disabled).toBe(true)
    expect(submitButton.text()).toContain('Menyimpan...')
  })

  it('mereset form ketika modal ditutup melalui perubahan prop show', async () => {
    const wrapper = mount(AddModal, {
      props: { show: true },
    })

    const inputs = wrapper.findAll('input')
    await inputs[0].setValue('Barang')
    await inputs[1].setValue('5000')
    await inputs[2].setValue('2027-01-01T12:00')

    await wrapper.setProps({ show: false })
    await nextTick()
    await wrapper.setProps({ show: true })

    const resetInputs = wrapper.findAll('input')

    expect(resetInputs[0].element.value).toBe('')
    expect(resetInputs[1].element.value).toBe('')
    expect(resetInputs[2].element.value).toBe('')
  })

  it('menutup modal saat area luar form diklik', async () => {
    const wrapper = mount(AddModal, {
      props: { show: true },
    })

    await wrapper.find('.fixed.inset-0').trigger('click.self')

    expect(wrapper.emitted('close')).toHaveLength(1)
  })
})
