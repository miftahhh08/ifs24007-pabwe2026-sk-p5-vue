
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useUsersStore } from './usersStore'
import * as userApi from '../api/userApi.js'

vi.mock('../api/userApi.js', () => ({
  getUsers: vi.fn(),
  getMyProfile: vi.fn(),
  updateMyProfile: vi.fn(),
  uploadMyPhoto: vi.fn(),
  updateMyPassword: vi.fn(),
}))

describe('usersStore.js', () => {
  let store

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useUsersStore()
    vi.resetAllMocks()
  })

  it('mempunyai state awal yang benar', () => {
    expect(store.users).toEqual([])
    expect(store.user).toBeNull()
    expect(store.profile).toBeNull()
    expect(store.isLoadingUsers).toBe(false)
    expect(store.isLoadingProfile).toBe(false)
    expect(store.isUpdatingProfile).toBe(false)
    expect(store.isUploadingPhoto).toBe(false)
    expect(store.isUpdatingPassword).toBe(false)
    expect(store.errorMessage).toBe('')
  })

  describe('fetchUsers', () => {
    it('mengambil daftar pengguna dari response.data berbentuk array', async () => {
      const users = [{ id: 1, name: 'User 1' }]
      userApi.getUsers.mockResolvedValue({ data: users })

      await expect(store.fetchUsers()).resolves.toEqual(users)
      expect(store.users).toEqual(users)
      expect(store.errorMessage).toBe('')
      expect(store.isLoadingUsers).toBe(false)
    })

    it('mengambil daftar pengguna dari properti users', async () => {
      const users = [{ id: 2, name: 'User 2' }]
      userApi.getUsers.mockResolvedValue({ data: { users } })

      await expect(store.fetchUsers()).resolves.toEqual(users)
      expect(store.users).toEqual(users)
    })

    it('mengambil daftar pengguna dari properti list', async () => {
      const users = [{ id: 3, name: 'User 3' }]
      userApi.getUsers.mockResolvedValue({ list: users })

      await expect(store.fetchUsers()).resolves.toEqual(users)
      expect(store.users).toEqual(users)
    })

    it('menghasilkan array kosong jika format daftar tidak dikenal', async () => {
      userApi.getUsers.mockResolvedValue({ data: { items: [] } })

      await expect(store.fetchUsers()).resolves.toEqual([])
      expect(store.users).toEqual([])
    })

    it('menyimpan pesan error dari API', async () => {
      const error = new Error('Gagal koneksi API')
      userApi.getUsers.mockRejectedValue(error)

      await expect(store.fetchUsers()).rejects.toBe(error)
      expect(store.errorMessage).toBe('Gagal koneksi API')
      expect(store.isLoadingUsers).toBe(false)
    })

    it('menggunakan pesan error default jika error tidak memiliki message', async () => {
      userApi.getUsers.mockRejectedValue({})

      await expect(store.fetchUsers()).rejects.toEqual({})
      expect(store.errorMessage).toBe('Gagal mengambil daftar pengguna.')
      expect(store.isLoadingUsers).toBe(false)
    })
  })

  describe('fetchMyProfile', () => {
    it('menyimpan profil dari response.data.user', async () => {
      const profile = { id: 1, name: 'Jannah' }
      userApi.getMyProfile.mockResolvedValue({ data: { user: profile } })

      await expect(store.fetchMyProfile()).resolves.toEqual(profile)
      expect(store.profile).toEqual(profile)
      expect(store.user).toEqual(profile)
      expect(store.isLoadingProfile).toBe(false)
    })

    it('mendukung profil pada properti profile', async () => {
      const profile = { id: 2, name: 'Pengguna' }
      userApi.getMyProfile.mockResolvedValue({ profile })

      await expect(store.fetchMyProfile()).resolves.toEqual(profile)
      expect(store.profile).toEqual(profile)
    })

    it('mendukung response profil tanpa wrapper', async () => {
      const profile = { id: 3, name: 'Pengguna' }
      userApi.getMyProfile.mockResolvedValue(profile)

      await expect(store.fetchMyProfile()).resolves.toEqual(profile)
    })

    it('menangani error profil', async () => {
      userApi.getMyProfile.mockRejectedValue(new Error('Profil gagal'))

      await expect(store.fetchMyProfile()).rejects.toThrow('Profil gagal')
      expect(store.errorMessage).toBe('Profil gagal')
      expect(store.isLoadingProfile).toBe(false)
    })

    it('menggunakan pesan default untuk error profil tanpa message', async () => {
      userApi.getMyProfile.mockRejectedValue({})

      await expect(store.fetchMyProfile()).rejects.toEqual({})
      expect(store.errorMessage).toBe('Gagal mengambil profil pengguna.')
      expect(store.isLoadingProfile).toBe(false)
    })
  })

  describe('saveProfile', () => {
    it('memperbarui profil dan mempertahankan data profil sebelumnya', async () => {
      store.profile = {
        id: 1,
        name: 'Nama Lama',
        email: 'user@example.com',
      }

      const data = { name: 'Nama Baru' }
      const response = { data: { user: { name: 'Nama Baru' } } }

      userApi.updateMyProfile.mockResolvedValue(response)

      await expect(store.saveProfile(data)).resolves.toBe(response)

      expect(userApi.updateMyProfile).toHaveBeenCalledWith(data)
      expect(store.profile).toEqual({
        id: 1,
        name: 'Nama Baru',
        email: 'user@example.com',
      })
      expect(store.user).toBe(store.profile)
      expect(store.isUpdatingProfile).toBe(false)
    })

    it('menyimpan profil baru tanpa profil sebelumnya', async () => {
      const profile = { name: 'Nama Baru' }
      userApi.updateMyProfile.mockResolvedValue({ data: profile })

      await store.saveProfile({ name: 'Nama Baru' })

      expect(store.profile).toEqual(profile)
      expect(store.user).toBe(store.profile)
    })

    it('mempertahankan profil lama dan menggabungkan data null', async () => {
      store.profile = { name: 'Profil Lama' }
      userApi.updateMyProfile.mockResolvedValue({ data: null })

      await store.saveProfile({ name: 'Profil Baru' })

      expect(store.profile).toEqual({
        name: 'Profil Lama',
        data: null,
      })
    })

    it('menangani error saat menyimpan profil', async () => {
      userApi.updateMyProfile.mockRejectedValue(new Error('Simpan gagal'))

      await expect(store.saveProfile({})).rejects.toThrow('Simpan gagal')
      expect(store.errorMessage).toBe('Simpan gagal')
      expect(store.isUpdatingProfile).toBe(false)
    })

    it('menggunakan pesan default untuk error simpan profil tanpa message', async () => {
      userApi.updateMyProfile.mockRejectedValue({})

      await expect(store.saveProfile({})).rejects.toEqual({})
      expect(store.errorMessage).toBe('Gagal memperbarui profil.')
      expect(store.isUpdatingProfile).toBe(false)
    })
  })

  describe('savePhoto', () => {
    it('menolak jika file foto tidak tersedia', async () => {
      await expect(store.savePhoto()).rejects.toThrow(
        'Pilih file foto terlebih dahulu.',
      )

      expect(userApi.uploadMyPhoto).not.toHaveBeenCalled()
      expect(store.isUploadingPhoto).toBe(false)
    })

    it('mengunggah foto dan memperbarui profil', async () => {
      store.profile = { id: 1, name: 'Pengguna' }

      const file = new File(['foto'], 'foto.png', {
        type: 'image/png',
      })

      const response = {
        data: { profile: { photo: 'foto.png' } },
      }

      userApi.uploadMyPhoto.mockResolvedValue(response)

      await expect(store.savePhoto(file)).resolves.toBe(response)

      expect(userApi.uploadMyPhoto).toHaveBeenCalledWith(file)
      expect(store.profile).toEqual({
        id: 1,
        name: 'Pengguna',
        photo: 'foto.png',
      })
      expect(store.user).toBe(store.profile)
      expect(store.isUploadingPhoto).toBe(false)
    })

    it('menyimpan profil foto tanpa profil sebelumnya', async () => {
      const file = new File(['foto'], 'foto.png', {
        type: 'image/png',
      })

      userApi.uploadMyPhoto.mockResolvedValue({
        photo: 'foto.png',
      })

      await store.savePhoto(file)

      expect(store.profile).toEqual({ photo: 'foto.png' })
    })

    it('menangani error saat mengunggah foto', async () => {
      const file = new File(['foto'], 'foto.png', {
        type: 'image/png',
      })

      userApi.uploadMyPhoto.mockRejectedValue(new Error('Upload gagal'))

      await expect(store.savePhoto(file)).rejects.toThrow('Upload gagal')
      expect(store.errorMessage).toBe('Upload gagal')
      expect(store.isUploadingPhoto).toBe(false)
    })

    it('menggunakan pesan default untuk error upload tanpa message', async () => {
      const file = new File(['foto'], 'foto.png', {
        type: 'image/png',
      })

      userApi.uploadMyPhoto.mockRejectedValue({})

      await expect(store.savePhoto(file)).rejects.toEqual({})
      expect(store.errorMessage).toBe('Gagal mengunggah foto profil.')
      expect(store.isUploadingPhoto).toBe(false)
    })
  })

  describe('savePassword', () => {
    it('memperbarui kata sandi', async () => {
      const data = {
        oldPassword: 'lama',
        newPassword: 'baru',
      }

      const response = { message: 'Berhasil' }

      userApi.updateMyPassword.mockResolvedValue(response)

      await expect(store.savePassword(data)).resolves.toBe(response)

      expect(userApi.updateMyPassword).toHaveBeenCalledWith(data)
      expect(store.isUpdatingPassword).toBe(false)
    })

    it('menangani error saat memperbarui kata sandi', async () => {
      userApi.updateMyPassword.mockRejectedValue(
        new Error('Password gagal'),
      )

      await expect(store.savePassword({})).rejects.toThrow(
        'Password gagal',
      )

      expect(store.errorMessage).toBe('Password gagal')
      expect(store.isUpdatingPassword).toBe(false)
    })

    it('menggunakan pesan default untuk error password tanpa message', async () => {
      userApi.updateMyPassword.mockRejectedValue({})

      await expect(store.savePassword({})).rejects.toEqual({})

      expect(store.errorMessage).toBe('Gagal mengubah kata sandi.')
      expect(store.isUpdatingPassword).toBe(false)
    })
  })
})