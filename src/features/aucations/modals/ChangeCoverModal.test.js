import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ChangeCoverModal from './ChangeCoverModal.vue'

describe('ChangeCoverModal.vue', () => {
  let wrapper

  const mountModal = (props = {}) => {
    return mount(ChangeCoverModal, {
      props: {
        show: true,
        loading: false,
        ...props,
      },
    })
  }

  const createImageFile = (
    name = 'cover.png',
    type = 'image/png',
  ) => {
    return new File(['gambar'], name, { type })
  }

  const selectFile = async (file) => {
    const input = wrapper.find('input[type="file"]')

    Object.defineProperty(input.element, 'files', {
      configurable: true,
      value: file ? [file] : [],
    })

    await input.trigger('change')
  }

  beforeEach(() => {
    wrapper = mountModal()
  })

  it('menampilkan modal ketika show bernilai true', () => {
    expect(wrapper.find('form').exists()).toBe(true)
    expect(wrapper.text()).toContain('Ubah Cover Lelang')
    expect(wrapper.text()).toContain('Pilih gambar')
  })

  it('tidak menampilkan modal ketika show bernilai false', async () => {
    await wrapper.setProps({ show: false })

    expect(wrapper.find('form').exists()).toBe(false)
  })

  it('menampilkan error ketika submit tanpa memilih gambar', async () => {
    await wrapper.find('form').trigger('submit')

    expect(wrapper.find('[role="alert"]').text()).toBe(
      'Pilih gambar cover terlebih dahulu.',
    )
    expect(wrapper.emitted('submit')).toBeUndefined()
  })

  it('menerima file gambar PNG', async () => {
    const file = createImageFile('cover.png', 'image/png')

    await selectFile(file)

    expect(wrapper.text()).toContain('cover.png')
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
  })

  it('menerima file gambar JPEG', async () => {
    const file = createImageFile('cover.jpg', 'image/jpeg')

    await selectFile(file)

    expect(wrapper.text()).toContain('cover.jpg')
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
  })

  it('menolak file yang bukan gambar', async () => {
    const file = createImageFile(
      'dokumen.pdf',
      'application/pdf',
    )

    await selectFile(file)

    expect(wrapper.find('[role="alert"]').text()).toBe(
      'File harus berupa gambar.',
    )
    expect(wrapper.text()).not.toContain('dokumen.pdf')
    expect(wrapper.vm.file).toBe(null)
    expect(wrapper.find('input[type="file"]').element.value).toBe('')
  })

  it('menghapus error ketika file gambar dipilih kembali', async () => {
    await wrapper.find('form').trigger('submit')

    expect(wrapper.find('[role="alert"]').exists()).toBe(true)

    await selectFile(createImageFile())

    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(wrapper.text()).toContain('cover.png')
  })

  it('mengosongkan file dan error ketika modal ditutup', async () => {
    await selectFile(createImageFile())

    expect(wrapper.vm.file.name).toBe('cover.png')

    await wrapper.find('form').trigger('submit')
    await wrapper.setProps({ show: false })

    expect(wrapper.vm.file).toBe(null)
    expect(wrapper.vm.error).toBe('')
  })

  it('mengirim file terpilih ketika submit', async () => {
    const file = createImageFile('cover.png', 'image/png')

    await selectFile(file)
    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('submit')).toHaveLength(1)
    expect(wrapper.emitted('submit')[0][0]).toBe(file)
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
  })

  it('menampilkan status Mengunggah ketika loading', async () => {
    await wrapper.setProps({ loading: true })

    expect(wrapper.text()).toContain('Mengunggah...')
    expect(
      wrapper.find('button[type="submit"]').element.disabled,
    ).toBe(true)
  })

  it('menampilkan status Unggah Cover ketika tidak loading', () => {
    expect(wrapper.text()).toContain('Unggah Cover')
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
    const button = wrapper
      .findAll('button')
      .find((item) => item.text() === 'Batal')

    await button.trigger('click')

    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('menutup modal ketika area luar diklik', async () => {
    const overlay = wrapper.find('.fixed.inset-0')

    overlay.element.dispatchEvent(
      new MouseEvent('click', { bubbles: true }),
    )

    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('tidak menutup modal ketika area luar diklik saat loading', async () => {
    await wrapper.setProps({ loading: true })

    const overlay = wrapper.find('.fixed.inset-0')

    overlay.element.dispatchEvent(
      new MouseEvent('click', { bubbles: true }),
    )

    expect(wrapper.emitted('close')).toBeUndefined()
  })

  it('tidak menutup modal ketika bagian form diklik', async () => {
    await wrapper.find('form').trigger('click')

    expect(wrapper.emitted('close')).toBeUndefined()
  })

  it('tidak mengirim submit ketika file belum dipilih', async () => {
    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('submit')).toBeUndefined()
  })

  it('mengosongkan file ketika pemilihan file dibatalkan', async () => {
    await selectFile(createImageFile())
    expect(wrapper.text()).toContain('cover.png')

    await selectFile(null)

    expect(wrapper.text()).not.toContain('cover.png')
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)

    await wrapper.find('form').trigger('submit')

    expect(wrapper.find('[role="alert"]').text()).toBe(
      'Pilih gambar cover terlebih dahulu.',
    )
    expect(wrapper.emitted('submit')).toBeUndefined()
  })
})