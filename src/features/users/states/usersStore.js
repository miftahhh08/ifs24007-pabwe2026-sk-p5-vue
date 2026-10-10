import { defineStore } from 'pinia'
import {
  getUsers,
  getMyProfile,
  updateMyProfile,
  uploadMyPhoto,
  updateMyPassword,
} from '../api/userApi.js'

function unwrapResponse(response) {
  return response?.data ?? response
}

function unwrapList(response) {
  const data = unwrapResponse(response)

  if (Array.isArray(data)) {
    return data
  }

  if (Array.isArray(data?.users)) {
    return data.users
  }

  if (Array.isArray(data?.list)) {
    return data.list
  }

  return []
}

function unwrapProfile(response) {
  const data = unwrapResponse(response)

  return data?.user ?? data?.profile ?? data
}

export const useUsersStore = defineStore('users', {
  state: () => ({
    users: [],
    user: null,
    profile: null,

    isLoadingUsers: false,
    isLoadingProfile: false,
    isUpdatingProfile: false,
    isUploadingPhoto: false,
    isUpdatingPassword: false,

    errorMessage: '',
  }),

  actions: {
    async fetchUsers() {
      this.isLoadingUsers = true
      this.errorMessage = ''

      try {
        const response = await getUsers()
        this.users = unwrapList(response)
      } catch (error) {
        this.errorMessage =
          error?.message || 'Gagal mengambil daftar pengguna.'
        throw error
      } finally {
        this.isLoadingUsers = false
      }

      return this.users
    },

    async fetchMyProfile() {
      this.isLoadingProfile = true
      this.errorMessage = ''

      let profile
      try {
        const response = await getMyProfile()
        profile = unwrapProfile(response)

        this.profile = profile
        this.user = profile
      } catch (error) {
        this.errorMessage =
          error?.message || 'Gagal mengambil profil pengguna.'
        throw error
      } finally {
        this.isLoadingProfile = false
      }

      return profile
    },

    async saveProfile(profileData) {
      this.isUpdatingProfile = true
      this.errorMessage = ''

      let response
      try {
        response = await updateMyProfile(profileData)
        const updatedProfile = unwrapProfile(response)

        if (updatedProfile && typeof updatedProfile === 'object') {
          this.profile = {
            ...(this.profile ?? {}),
            ...updatedProfile,
          }

          this.user = this.profile
        }
      } catch (error) {
        this.errorMessage =
          error?.message || 'Gagal memperbarui profil.'
        throw error
      } finally {
        this.isUpdatingProfile = false
      }

      return response
    },

    async savePhoto(file) {
      if (!file) {
        throw new Error('Pilih file foto terlebih dahulu.')
      }

      this.isUploadingPhoto = true
      this.errorMessage = ''

      let response
      try {
        response = await uploadMyPhoto(file)
        const updatedProfile = unwrapProfile(response)

        if (updatedProfile && typeof updatedProfile === 'object') {
          this.profile = {
            ...(this.profile ?? {}),
            ...updatedProfile,
          }

          this.user = this.profile
        }
      } catch (error) {
        this.errorMessage =
          error?.message || 'Gagal mengunggah foto profil.'
        throw error
      } finally {
        this.isUploadingPhoto = false
      }

      return response
    },

    async savePassword(passwordData) {
      this.isUpdatingPassword = true
      this.errorMessage = ''

      let result
      try {
        result = await updateMyPassword(passwordData)
      } catch (error) {
        this.errorMessage =
          error?.message || 'Gagal mengubah kata sandi.'
        throw error
      } finally {
        this.isUpdatingPassword = false
      }

      return result
    },
  },
})