import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import Swal from 'sweetalert2'
import { renderWithProviders } from '../../../test-utils.js'
import RegisterPage from './RegisterPage.vue'
import * as authApi from '../api/authApi.js'

vi.mock('sweetalert2', () => ({ default: { fire: vi.fn() } }))
vi.mock('../api/authApi.js', () => ({ loginRequest: vi.fn(), registerRequest: vi.fn() }))

const routes = [
  { path: '/', name: 'home', component: { template: '<div />' } },
  { path: '/auth/login', name: 'login', component: { template: '<div />' } },
]

async function setup() {
  const result = renderWithProviders(RegisterPage, { routes })
  await result.router.isReady()
  return result
}

async function fill(wrapper, { name = 'Budi', email = 'a@b.com', pw = 'rahasia123', confirm = 'rahasia123' } = {}) {
  await wrapper.find('#register-name').setValue(name)
  await wrapper.find('#register-email').setValue(email)
  await wrapper.find('#register-password').setValue(pw)
  await wrapper.find('#register-confirm-password').setValue(confirm)
  await wrapper.find('form').trigger('submit')
  await flushPromises()
}

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Swal.fire.mockResolvedValue({ isConfirmed: true })
  })

  it.each([
    [{ name: '' }, 'Semua kolom wajib diisi'],
    [{ email: 'salah' }, 'email yang valid'],
    [{ pw: 'pendek', confirm: 'pendek' }, 'minimal 8 karakter'],
    [{ confirm: 'beda-beda' }, 'tidak cocok'],
  ])('validasi form %j', async (values, message) => {
    const { wrapper } = await setup()
    await fill(wrapper, values)
    expect(wrapper.find('[role="alert"]').text()).toContain(message)
    expect(authApi.registerRequest).not.toHaveBeenCalled()
  })

  it('registrasi berhasil menuju halaman login', async () => {
    authApi.registerRequest.mockResolvedValue({ status: 'success' })
    const { wrapper, router } = await setup()
    await fill(wrapper)
    expect(authApi.registerRequest).toHaveBeenCalledWith({
      name: 'Budi',
      email: 'a@b.com',
      password: 'rahasia123',
    })
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'success' }))
    expect(router.currentRoute.value.name).toBe('login')
  })

  it('menampilkan error saat registrasi gagal', async () => {
    authApi.registerRequest.mockRejectedValue(new Error('Email sudah dipakai'))
    const { wrapper } = await setup()
    await fill(wrapper)
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ text: 'Email sudah dipakai' }))
  })

  it('memakai pesan cadangan saat error tanpa pesan', async () => {
    authApi.registerRequest.mockRejectedValue({})
    const { wrapper } = await setup()
    await fill(wrapper)
    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({ text: 'Registrasi gagal. Silakan coba kembali.' }),
    )
  })

  it('menautkan ke login dan menampilkan status proses', async () => {
    const { wrapper } = await setup()
    expect(wrapper.find('a').attributes('href')).toBe('/auth/login')
    authApi.registerRequest.mockReturnValue(new Promise(() => {}))
    await fill(wrapper)
    expect(wrapper.find('button[type="submit"]').text()).toBe('Sedang mendaftar...')
  })
})
