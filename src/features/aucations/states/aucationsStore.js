import { defineStore } from 'pinia'

import {
  getAucations,
  getAucationById,
  addAucation as addAucationRequest,
  updateAucation,
  uploadAucationCover,
  deleteAucation as deleteAucationRequest,
  addBid as addBidRequest,
  deleteBid as deleteBidRequest,
  deleteAllAucations as deleteAllAucationsRequest,
} from '../api/aucationApi.js'

function unwrapResponse(response) {
  return response?.data ?? response
}

function unwrapList(response) {
  const data = unwrapResponse(response)

  if (Array.isArray(data)) {
    return data
  }

  if (Array.isArray(data?.aucations)) {
    return data.aucations
  }

  if (Array.isArray(data?.auctions)) {
    return data.auctions
  }

  if (Array.isArray(data?.list)) {
    return data.list
  }

  return []
}

function unwrapAucation(response) {
  const data = unwrapResponse(response)

  return data?.aucation ?? data?.auction ?? data?.item ?? data
}

export const useAucationsStore = defineStore('aucations', {
  state: () => ({
    aucations: [],
    aucation: null,
    isAucation: false,

    isAucationAdd: false,
    isAucationAdded: false,

    isAucationChange: false,
    isAucationChanged: false,

    isAucationChangeCover: false,
    isAucationChangedCover: false,

    isAucationDelete: false,
    isAucationDeleted: false,

    isBidAdd: false,
    isBidAdded: false,

    isBidDelete: false,
    isBidDeleted: false,

    isAucationDeleteAll: false,
    isAucationDeletedAll: false,

    errorMessage: '',
  }),

  actions: {
    async fetchAucations(filters = {}) {
      this.isAucation = true
      this.errorMessage = ''

      try {
        const response = await getAucations(filters)
        this.aucations = unwrapList(response)
      } catch (error) {
        this.errorMessage =
          error?.message || 'Gagal mengambil daftar lelang.'

        throw error
      } finally {
        this.isAucation = false
      }

      return this.aucations
    },

    async fetchAucation(id) {
      this.isAucation = true
      this.errorMessage = ''

      try {
        const response = await getAucationById(id)
        this.aucation = unwrapAucation(response)
      } catch (error) {
        this.errorMessage =
          error?.message || 'Gagal mengambil detail lelang.'

        throw error
      } finally {
        this.isAucation = false
      }

      return this.aucation
    },

    async addAucation(aucationData) {
      this.isAucationAdd = true
      this.isAucationAdded = false
      this.errorMessage = ''

      let response
      try {
        response = await addAucationRequest(aucationData)
        const created = unwrapAucation(response)

        if (created && typeof created === 'object') {
          this.aucations = [created, ...this.aucations]
        }

        this.isAucationAdded = true
      } catch (error) {
        this.errorMessage =
          error?.message || 'Gagal menambahkan lelang.'

        throw error
      } finally {
        this.isAucationAdd = false
      }

      return response
    },

    async changeAucation(id, aucationData) {
      this.isAucationChange = true
      this.isAucationChanged = false
      this.errorMessage = ''

      let response
      try {
        response = await updateAucation(id, aucationData)
        const updated = unwrapAucation(response)

        if (updated && typeof updated === 'object') {
          this.aucations = this.aucations.map((item) => {
            return String(item.id) === String(id)
              ? { ...item, ...updated }
              : item
          })

          if (
            this.aucation &&
            String(this.aucation.id) === String(id)
          ) {
            this.aucation = { ...this.aucation, ...updated }
          }
        }

        this.isAucationChanged = true
      } catch (error) {
        this.errorMessage =
          error?.message || 'Gagal memperbarui data lelang.'

        throw error
      } finally {
        this.isAucationChange = false
      }

      return response
    },

    async changeAucationCover(id, file) {
      if (!file) {
        throw new Error('Pilih file cover terlebih dahulu.')
      }

      this.isAucationChangeCover = true
      this.isAucationChangedCover = false
      this.errorMessage = ''

      let response
      try {
        response = await uploadAucationCover(id, file)
        const updated = unwrapAucation(response)

        if (updated && typeof updated === 'object') {
          this.aucations = this.aucations.map((item) => {
            return String(item.id) === String(id)
              ? { ...item, ...updated }
              : item
          })

          if (
            this.aucation &&
            String(this.aucation.id) === String(id)
          ) {
            this.aucation = { ...this.aucation, ...updated }
          }
        }

        this.isAucationChangedCover = true
      } catch (error) {
        this.errorMessage =
          error?.message || 'Gagal mengunggah cover lelang.'

        throw error
      } finally {
        this.isAucationChangeCover = false
      }

      return response
    },

    async deleteAucation(id) {
      this.isAucationDelete = true
      this.isAucationDeleted = false
      this.errorMessage = ''

      let response
      try {
        response = await deleteAucationRequest(id)

        this.aucations = this.aucations.filter(
          (item) => String(item.id) !== String(id),
        )

        if (
          this.aucation &&
          String(this.aucation.id) === String(id)
        ) {
          this.aucation = null
        }

        this.isAucationDeleted = true
      } catch (error) {
        this.errorMessage =
          error?.message || 'Gagal menghapus lelang.'

        throw error
      } finally {
        this.isAucationDelete = false
      }

      return response
    },

    async addBid(id, bidData) {
      this.isBidAdd = true
      this.isBidAdded = false
      this.errorMessage = ''

      let response
      try {
        response = await addBidRequest(id, bidData)
        this.isBidAdded = true
      } catch (error) {
        this.errorMessage =
          error?.message || 'Gagal mengajukan penawaran.'

        throw error
      } finally {
        this.isBidAdd = false
      }

      return response
    },

    async deleteBid(id, bidData) {
      this.isBidDelete = true
      this.isBidDeleted = false
      this.errorMessage = ''

      let response
      try {
        response = await deleteBidRequest(id, bidData)
        this.isBidDeleted = true
      } catch (error) {
        this.errorMessage =
          error?.message || 'Gagal menghapus penawaran.'

        throw error
      } finally {
        this.isBidDelete = false
      }

      return response
    },

    async deleteAllAucations() {
      this.isAucationDeleteAll = true
      this.isAucationDeletedAll = false
      this.errorMessage = ''

      let response
      try {
        response = await deleteAllAucationsRequest()

        this.aucations = []
        this.aucation = null
        this.isAucationDeletedAll = true
      } catch (error) {
        this.errorMessage =
          error?.message || 'Gagal menghapus seluruh lelang.'

        throw error
      } finally {
        this.isAucationDeleteAll = false
      }

      return response
    },
  },
})