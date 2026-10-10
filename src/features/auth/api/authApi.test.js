
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../../helpers/apiHelper.js', () => ({
  fetchApi: vi.fn(),
}))

import { fetchApi } from '../../../helpers/apiHelper.js'
import { loginRequest, registerRequest } from './authApi.js'

describe('authApi', () => {
  beforeEach(() => vi.clearAllMocks())

  it('mengirim permintaan login', async () => {
    fetchApi.mockResolvedValue({ data: { accessToken: 'token' } })
    const credentials = { email: 'test@example.com', password: 'secret' }

    await expect(loginRequest(credentials)).resolves.toEqual({
      data: { accessToken: 'token' },
    })

    expect(fetchApi).toHaveBeenCalledWith('/auth/login', {
      method: 'POST',
      body: credentials,
    })
  })

  it('meneruskan error login', async () => {
    const error = new Error('Login gagal')
    fetchApi.mockRejectedValue(error)

    await expect(loginRequest({})).rejects.toBe(error)
  })

  it('mengirim permintaan registrasi', async () => {
    fetchApi.mockResolvedValue({ message: 'Berhasil' })
    const userData = {
      name: 'Pengguna Tes',
      email: 'test@example.com',
      password: 'secret',
    }

    await expect(registerRequest(userData)).resolves.toEqual({
      message: 'Berhasil',
    })

    expect(fetchApi).toHaveBeenCalledWith('/auth/register', {
      method: 'POST',
      body: userData,
    })
  })

  it('meneruskan error registrasi', async () => {
    const error = new Error('Registrasi gagal')
    fetchApi.mockRejectedValue(error)

    await expect(registerRequest({})).rejects.toBe(error)
  })
})