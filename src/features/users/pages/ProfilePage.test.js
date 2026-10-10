import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import Swal from 'sweetalert2'
import { renderWithProviders } from '../../../test-utils.js'
import ProfilePage from './ProfilePage.vue'
import * as userApi from '../api/userApi.js'

vi.mock('sweetalert2', () => ({ default: { fire: vi.fn() } }))
vi.mock('../api/userApi.js', () => ({
  getMyProfile: vi.fn(),
  updateMyProfile: vi.fn(),
  uploadMyPhoto: vi.fn(),
  updateMyPassword: vi.fn(),
}))

const profile = { id: 1, name: 'Budi', email: 'b@x.com', photo: 'img/b.png' }

async function setup(profileResponse = { data: { user: profile } }) {
  userApi.getMyProfile.mockResolvedValue(profileResponse)
  const result = renderWithProviders(ProfilePage)
  await result.router.isReady()
  await flushPromises()
  return result
}

async function submit(wrapper, index) {
  await wrapper.findAll('form')[index].trigger('submit')
  await flushPromises()
}

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Swal.fire.mockResolvedValue({ isConfirmed: true })
  })

  it('memuat profil ke dalam form dan menampilkan foto', async () => {
    const { wrapper } = await setup()
    expect(wrapper.find('#profile-name').element.value).toBe('Budi')
    expect(wrapper.find('#profile-email').element.value).toBe('b@x.com')
    expect(wrapper.find('img').attributes('src')).toBe('https://open-api.delcom.org/img/b.png')
  })

  it('mengisi nilai kosong bila field profil tidak ada', async () => {
    const { wrapper } = await setup({ data: { user: { id: 1 } } })
    expect(wrapper.find('#profile-name').element.value).toBe('')
    expect(wrapper.find('img').exists()).toBe(false)
  })

  it('menampilkan loading dan error beserta tombol coba lagi', async () => {
    userApi.getMyProfile.mockReturnValue(new Promise(() => {}))
    const loading = renderWithProviders(ProfilePage)
    await loading.wrapper.vm.$nextTick()
    expect(loading.wrapper.text()).toContain('Memuat profil')

    userApi.getMyProfile.mockRejectedValue(new Error('Gagal profil'))
    const { wrapper } = renderWithProviders(ProfilePage)
    await flushPromises()
    expect(wrapper.find('[role="alert"]').text()).toBe('Gagal profil')

    userApi.getMyProfile.mockResolvedValue({ data: { user: profile } })
    await wrapper.find('button').trigger('click')
    await flushPromises()
    expect(wrapper.find('#profile-name').element.value).toBe('Budi')
  })

  it('retry yang gagal tidak melempar error', async () => {
    userApi.getMyProfile.mockRejectedValue(new Error('x'))
    const { wrapper } = renderWithProviders(ProfilePage)
    await flushPromises()
    await wrapper.find('button').trigger('click')
    await flushPromises()
    expect(wrapper.find('[role="alert"]').text()).toBe('x')
  })

  it('memvalidasi dan menyimpan profil', async () => {
    userApi.updateMyProfile.mockResolvedValue({ data: { user: { ...profile, name: 'Baru' } } })
    const { wrapper } = await setup()

    await wrapper.find('#profile-name').setValue('')
    await submit(wrapper, 0)
    expect(wrapper.find('[role="alert"]').text()).toContain('wajib diisi')

    await wrapper.find('#profile-name').setValue('Baru')
    await wrapper.find('#profile-email').setValue('salah')
    await submit(wrapper, 0)
    expect(wrapper.find('[role="alert"]').text()).toContain('email yang valid')

    await wrapper.find('#profile-email').setValue('b@x.com')
    await submit(wrapper, 0)
    expect(userApi.updateMyProfile).toHaveBeenCalledWith({ name: 'Baru', email: 'b@x.com' })
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'success' }))
  })

  it('menampilkan error saat simpan profil gagal', async () => {
    userApi.updateMyProfile.mockRejectedValue(new Error('Email dipakai'))
    const { wrapper } = await setup()
    await submit(wrapper, 0)
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ text: 'Email dipakai' }))

    userApi.updateMyProfile.mockRejectedValue({})
    await submit(wrapper, 0)
    expect(Swal.fire).toHaveBeenLastCalledWith(expect.objectContaining({ text: 'Profil gagal diperbarui.' }))
  })

  async function choose(wrapper, file) {
    const input = wrapper.find('#profile-photo')
    Object.defineProperty(input.element, 'files', { value: file ? [file] : [], configurable: true })
    await input.trigger('change')
  }

  it('memvalidasi dan mengunggah foto', async () => {
    userApi.uploadMyPhoto.mockResolvedValue({ data: { user: profile } })
    const { wrapper } = await setup()

    await submit(wrapper, 1)
    expect(wrapper.find('[role="alert"]').text()).toContain('Pilih foto')

    await choose(wrapper, new File(['x'], 'a.txt', { type: 'text/plain' }))
    await submit(wrapper, 1)
    expect(wrapper.find('[role="alert"]').text()).toContain('berupa gambar')

    await choose(wrapper, null)
    await submit(wrapper, 1)
    expect(userApi.uploadMyPhoto).not.toHaveBeenCalled()

    const file = new File(['x'], 'a.png', { type: 'image/png' })
    await choose(wrapper, file)
    await submit(wrapper, 1)
    expect(userApi.uploadMyPhoto).toHaveBeenCalledWith(file)
    expect(userApi.getMyProfile).toHaveBeenCalledTimes(2)
  })

  it('menampilkan error saat unggah foto gagal', async () => {
    userApi.uploadMyPhoto.mockRejectedValue(new Error('Terlalu besar'))
    const { wrapper } = await setup()
    await choose(wrapper, new File(['x'], 'a.png', { type: 'image/png' }))
    await submit(wrapper, 1)
    expect(Swal.fire).toHaveBeenLastCalledWith(expect.objectContaining({ text: 'Terlalu besar' }))

    userApi.uploadMyPhoto.mockRejectedValue({})
    await submit(wrapper, 1)
    expect(Swal.fire).toHaveBeenLastCalledWith(expect.objectContaining({ text: 'Foto profil gagal diunggah.' }))
  })

  async function fillPasswords(wrapper, current, next, confirm) {
    await wrapper.find('#current-password').setValue(current)
    await wrapper.find('#new-password').setValue(next)
    await wrapper.find('#confirm-password').setValue(confirm)
    await submit(wrapper, 2)
  }

  it('memvalidasi form kata sandi', async () => {
    const { wrapper } = await setup()
    await fillPasswords(wrapper, '', '', '')
    expect(wrapper.find('[role="alert"]').text()).toContain('wajib diisi')
    await fillPasswords(wrapper, 'lama', 'pendek', 'pendek')
    expect(wrapper.find('[role="alert"]').text()).toContain('minimal 8')
    await fillPasswords(wrapper, 'lama', 'baru12345', 'beda12345')
    expect(wrapper.find('[role="alert"]').text()).toContain('tidak cocok')
    expect(userApi.updateMyPassword).not.toHaveBeenCalled()
  })

  it('mengganti kata sandi sesuai kontrak API', async () => {
    userApi.updateMyPassword.mockResolvedValue({ status: 'success' })
    const { wrapper } = await setup()
    await fillPasswords(wrapper, 'lama', 'baru12345', 'baru12345')
    expect(userApi.updateMyPassword).toHaveBeenCalledWith({
      password: 'lama',
      new_password: 'baru12345',
      new_password_confirmation: 'baru12345',
    })
    expect(wrapper.find('#new-password').element.value).toBe('')
  })

  it('menampilkan error saat ganti kata sandi gagal', async () => {
    userApi.updateMyPassword.mockRejectedValue(new Error('Sandi lama salah'))
    const { wrapper } = await setup()
    await fillPasswords(wrapper, 'lama', 'baru12345', 'baru12345')
    expect(Swal.fire).toHaveBeenLastCalledWith(expect.objectContaining({ text: 'Sandi lama salah' }))

    userApi.updateMyPassword.mockRejectedValue({})
    await fillPasswords(wrapper, 'lama', 'baru12345', 'baru12345')
    expect(Swal.fire).toHaveBeenLastCalledWith(expect.objectContaining({ text: 'Kata sandi gagal diubah.' }))
  })
})
