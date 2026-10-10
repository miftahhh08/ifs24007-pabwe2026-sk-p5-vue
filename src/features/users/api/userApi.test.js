
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../../helpers/apiHelper.js', () => ({
  fetchApi: vi.fn(),
}))

import { fetchApi } from '../../../helpers/apiHelper.js'
import {
  getUsers,
  getMyProfile,
  updateMyProfile,
  uploadMyPhoto,
  updateMyPassword,
} from './userApi.js'

describe('userApi', () => {
  beforeEach(() => vi.clearAllMocks())

  it('mengambil daftar pengguna', async () => {
    fetchApi.mockResolvedValue({ data: [] })

    await expect(getUsers()).resolves.toEqual({ data: [] })
    expect(fetchApi).toHaveBeenCalledWith('/users')
  })

  it('mengambil profil pengguna aktif', async () => {
    fetchApi.mockResolvedValue({ data: { user: { name: 'Jannah' } } })

    await expect(getMyProfile()).resolves.toEqual({
      data: { user: { name: 'Jannah' } },
    })
    expect(fetchApi).toHaveBeenCalledWith('/users/me')
  })

  it('memperbarui profil pengguna', async () => {
    const profile = { name: 'Jannah', email: 'jannah@example.com' }
    fetchApi.mockResolvedValue({ message: 'Berhasil' })

    await updateMyProfile(profile)

    expect(fetchApi).toHaveBeenCalledWith('/users/me', {
      method: 'PUT',
      body: profile,
    })
  })

  it('mengunggah foto dalam bentuk FormData', async () => {
    const file = new File(['foto'], 'foto.png', { type: 'image/png' })
    fetchApi.mockResolvedValue({ message: 'Foto diunggah' })

    await uploadMyPhoto(file)

    const [endpoint, options] = fetchApi.mock.calls[0]

    expect(endpoint).toBe('/users/me/photo')
    expect(options.method).toBe('POST')
    expect(options.body).toBeInstanceOf(FormData)
    expect(options.body.get('photo')).toBe(file)
  })

  it('memperbarui kata sandi', async () => {
    const password = { old_password: 'lama', new_password: 'baru' }
    fetchApi.mockResolvedValue({ message: 'Berhasil' })

    await updateMyPassword(password)

    expect(fetchApi).toHaveBeenCalledWith('/users/me/password', {
      method: 'PUT',
      body: password,
    })
  })

  it.each([
    ['getUsers', () => getUsers(), '/users'],
    ['getMyProfile', () => getMyProfile(), '/users/me'],
    ['updateMyProfile', () => updateMyProfile({}), '/users/me'],
    ['uploadMyPhoto', () => uploadMyPhoto(new File(['x'], 'x.png')), '/users/me/photo'],
    ['updateMyPassword', () => updateMyPassword({}), '/users/me/password'],
  ])('meneruskan error dari %s', async (_name, action, endpoint) => {
    const error = new Error('Request gagal')
    fetchApi.mockRejectedValue(error)

    await expect(action()).rejects.toBe(error)
    expect(
  fetchApi.mock.calls.some(([url]) => url === endpoint),
).toBe(true)
  })
})