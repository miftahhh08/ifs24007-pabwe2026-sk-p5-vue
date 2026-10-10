
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthStore } from './authStore'
import { loginRequest, registerRequest } from '../api/authApi'
import { getAccessToken, putAccessToken } from '../../../helpers/apiHelper'

vi.mock('../api/authApi', () => ({
  loginRequest: vi.fn(),
  registerRequest: vi.fn(),
}))

vi.mock('../../../helpers/apiHelper', () => ({
  getAccessToken: vi.fn(),
  putAccessToken: vi.fn(),
}))

describe('authStore.js', () => {
  let store

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    sessionStorage.clear()
    getAccessToken.mockReturnValue('')
    setActivePinia(createPinia())
    store = useAuthStore()
  })

  afterEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  it('menginisialisasi state dan token dari helper', () => {
    expect(store.token).toBe('')
    expect(store.user).toBeNull()
    expect(store.isAuthLogin).toBe(false)
    expect(store.isAuthRegister).toBe(false)
    expect(store.isAuthLogout).toBe(false)
    expect(store.errorMessage).toBe('')
    expect(store.isAuthenticated).toBe(false)
    expect(getAccessToken).toHaveBeenCalled()
  })

  it('mengambil user dari localStorage', () => {
    localStorage.setItem(
      'authUser',
      JSON.stringify({ id: '1', name: 'Jannah' }),
    )

    setActivePinia(createPinia())
    store = useAuthStore()

    expect(store.user).toEqual({ id: '1', name: 'Jannah' })
  })

  it('mengembalikan null jika data user tidak valid', () => {
    localStorage.setItem('authUser', '{data tidak valid')

    setActivePinia(createPinia())
    store = useAuthStore()

    expect(store.user).toBeNull()
    expect(localStorage.getItem('authUser')).toBeNull()
  })

  it('menggunakan access token sebagai status autentikasi', () => {
    getAccessToken.mockReturnValue('token-123')

    setActivePinia(createPinia())
    store = useAuthStore()

    expect(store.token).toBe('token-123')
    expect(store.isAuthenticated).toBe(true)
  })

  it('login berhasil dengan token dan user di dalam data', async () => {
    const response = {
      data: {
        accessToken: 'token-123',
        user: { id: '1', name: 'User Test' },
      },
    }

    loginRequest.mockResolvedValue(response)

    await expect(
      store.login({ username: 'test', password: '123' }),
    ).resolves.toEqual(response)

    expect(store.token).toBe('token-123')
    expect(store.user).toEqual({ id: '1', name: 'User Test' })
    expect(store.isAuthenticated).toBe(true)
    expect(putAccessToken).toHaveBeenCalledWith('token-123')
    expect(localStorage.getItem('authUser')).toBe(
      JSON.stringify({ id: '1', name: 'User Test' }),
    )
    expect(store.isAuthLogin).toBe(false)
  })

  it.each([
    [{ data: { accessToken: 'token-a' } }, 'token-a'],
    [{ data: { access_token: 'token-b' } }, 'token-b'],
    [{ data: { token: 'token-c' } }, 'token-c'],
    [{ accessToken: 'token-d' }, 'token-d'],
    [{ access_token: 'token-e' }, 'token-e'],
    [{ token: 'token-f' }, 'token-f'],
  ])('menerima variasi format token', async (response, token) => {
    loginRequest.mockResolvedValue(response)

    await store.login({ username: 'test', password: '123' })

    expect(store.token).toBe(token)
    expect(putAccessToken).toHaveBeenCalledWith(token)
  })

  it('menerima respons tanpa pembungkus data', async () => {
    const response = {
      token: 'token-flat',
      user: { id: '2', name: 'User Flat' },
    }

    loginRequest.mockResolvedValue(response)

    await store.login({ username: 'test', password: '123' })

    expect(store.token).toBe('token-flat')
    expect(store.user).toEqual(response.user)
  })

  it.each([
    { profile: { id: '3', name: 'Profile User' } },
    { me: { id: '4', name: 'Me User' } },
  ])('menerima format user alternatif', async (userData) => {
    loginRequest.mockResolvedValue({
      data: { token: 'token-user', ...userData },
    })

    await store.login({ username: 'test', password: '123' })

    expect(store.user).toEqual(
      userData.profile ?? userData.me,
    )
  })

  it('menghapus user lama jika login tidak mengembalikan user', async () => {
    localStorage.setItem('authUser', JSON.stringify({ id: 'old' }))
    loginRequest.mockResolvedValue({ token: 'token-new' })

    await store.login({ username: 'test', password: '123' })

    expect(store.user).toBeNull()
    expect(localStorage.getItem('authUser')).toBeNull()
  })

  it('menangani respons login tanpa token', async () => {
    loginRequest.mockResolvedValue({ data: { user: { id: '1' } } })

    await expect(store.login({})).rejects.toThrow(
      'Login berhasil diproses, tetapi token tidak ditemukan pada respons API.',
    )

    expect(store.errorMessage).toContain('token tidak ditemukan')
    expect(store.isAuthLogin).toBe(false)
  })

  it('menangani error login dengan message', async () => {
    loginRequest.mockRejectedValue(new Error('Login gagal dari API'))

    await expect(store.login({})).rejects.toThrow('Login gagal dari API')

    expect(store.errorMessage).toBe('Login gagal dari API')
    expect(store.isAuthLogin).toBe(false)
  })

  it('menggunakan pesan fallback jika error login tidak memiliki message', async () => {
    loginRequest.mockRejectedValue({})

    await expect(store.login({})).rejects.toEqual({})

    expect(store.errorMessage).toBe('Login gagal. Silakan coba kembali.')
    expect(store.isAuthLogin).toBe(false)
  })

  it('berhasil melakukan registrasi', async () => {
    const response = { message: 'Registrasi berhasil' }
    registerRequest.mockResolvedValue(response)

    await expect(store.register({ username: 'user' })).resolves.toEqual(response)

    expect(registerRequest).toHaveBeenCalledWith({ username: 'user' })
    expect(store.isAuthRegister).toBe(false)
    expect(store.errorMessage).toBe('')
  })

  it('menangani error registrasi dengan message', async () => {
    registerRequest.mockRejectedValue(new Error('Registrasi ditolak'))

    await expect(store.register({})).rejects.toThrow('Registrasi ditolak')

    expect(store.errorMessage).toBe('Registrasi ditolak')
    expect(store.isAuthRegister).toBe(false)
  })

  it('menggunakan pesan fallback jika error registrasi tidak memiliki message', async () => {
    registerRequest.mockRejectedValue({})

    await expect(store.register({})).rejects.toEqual({})

    expect(store.errorMessage).toBe(
      'Registrasi gagal. Silakan coba kembali.',
    )
    expect(store.isAuthRegister).toBe(false)
  })

  it('berhasil logout dan membersihkan autentikasi', async () => {
    store.token = 'token-123'
    store.user = { id: '1', name: 'User Test' }
    store.errorMessage = 'Error lama'
    localStorage.setItem('authUser', JSON.stringify(store.user))

    await store.logout()

    expect(store.token).toBe('')
    expect(store.user).toBeNull()
    expect(store.errorMessage).toBe('')
    expect(putAccessToken).toHaveBeenCalledWith(null)
    expect(localStorage.getItem('authUser')).toBeNull()
    expect(store.isAuthLogout).toBe(false)
    expect(store.isAuthenticated).toBe(false)
  })
})