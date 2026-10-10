import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import Swal from 'sweetalert2'
import { renderWithProviders } from '../../../test-utils.js'
import LoginPage from './LoginPage.vue'
import * as authApi from '../api/authApi.js'

vi.mock('sweetalert2', () => ({ default: { fire: vi.fn() } }))
vi.mock('../api/authApi.js', () => ({ loginRequest: vi.fn(), registerRequest: vi.fn() }))

const routes = [
  { path: '/', name: 'home', component: { template: '<div />' } },
  { path: '/auth/login', name: 'login', component: LoginPage },
  { path: '/auth/register', name: 'register', component: { template: '<div />' } },
]

async function setup() {
  const result = renderWithProviders(LoginPage, { routes })
  await result.router.isReady()
  return result
}

async function submit(wrapper, email, password) {
  await wrapper.find('#login-email-input').setValue(email)
  await wrapper.find('#login-password-input').setValue(password)
  await wrapper.find('form').trigger('submit')
  await flushPromises()
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    Swal.fire.mockResolvedValue({ isConfirmed: true })
  })

  it('memvalidasi kolom wajib', async () => {
    const { wrapper } = await setup()
    await submit(wrapper, '', '')
    expect(wrapper.find('[role="alert"]').text()).toContain('wajib diisi')
    expect(authApi.loginRequest).not.toHaveBeenCalled()
  })

  it('memvalidasi format email', async () => {
    const { wrapper } = await setup()
    await submit(wrapper, 'salah', 'rahasia')
    expect(wrapper.find('[role="alert"]').text()).toContain('email yang valid')
  })

  it('login berhasil menyimpan token dan menuju beranda', async () => {
    authApi.loginRequest.mockResolvedValue({ data: { token: 'tok', user: { id: 1, name: 'A' } } })
    const { wrapper, router } = await setup()
    await submit(wrapper, 'a@b.com', 'rahasia')
    expect(authApi.loginRequest).toHaveBeenCalledWith({ email: 'a@b.com', password: 'rahasia' })
    expect(localStorage.getItem('accessToken')).toBe('tok')
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'success' }))
    expect(router.currentRoute.value.name).toBe('home')
  })

  it('menampilkan dialog error saat login gagal', async () => {
    authApi.loginRequest.mockRejectedValue(new Error('Kredensial salah'))
    const { wrapper } = await setup()
    await submit(wrapper, 'a@b.com', 'rahasia')
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'error', text: 'Kredensial salah' }))
  })

  it('memakai pesan cadangan bila error tanpa pesan', async () => {
    authApi.loginRequest.mockRejectedValue({})
    const { wrapper } = await setup()
    await submit(wrapper, 'a@b.com', 'rahasia')
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ text: 'Login gagal. Silakan coba kembali.' }))

    authApi.loginRequest.mockRejectedValue(undefined)
    await submit(wrapper, 'a@b.com', 'rahasia')
    expect(Swal.fire).toHaveBeenLastCalledWith(
      expect.objectContaining({ text: 'Login gagal. Silakan coba kembali.' }),
    )
  })

  it('toggle lihat/sembunyikan kata sandi', async () => {
    const { wrapper } = await setup()
    const input = wrapper.find('#login-password-input')
    expect(input.attributes('type')).toBe('password')
    await wrapper.find('button[type="button"]').trigger('click')
    expect(input.attributes('type')).toBe('text')
    expect(wrapper.find('button[type="button"]').text()).toBe('Sembunyikan')
  })

  it('menautkan ke halaman registrasi dan menonaktifkan tombol saat proses', async () => {
    const { wrapper } = await setup()
    expect(wrapper.find('a').attributes('href')).toBe('/auth/register')
    authApi.loginRequest.mockReturnValue(new Promise(() => {}))
    await wrapper.find('#login-email-input').setValue('a@b.com')
    await wrapper.find('#login-password-input').setValue('rahasia')
    await wrapper.find('form').trigger('submit')
    expect(wrapper.find('#login-submit-button').text()).toBe('Sedang masuk...')
  })
})
