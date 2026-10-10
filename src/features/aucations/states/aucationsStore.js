import { defineStore } from 'pinia'
import {
  getAucations,
  getAucationById,
  addAucation,
  updateAucation,
  uploadAucationCover,
  deleteAucation,
  addBid,
  deleteBid,
  deleteAllAucations,
} from '../api/aucationApi.js'

/**
 * Membungkus aksi mutasi: mengatur flag proses/berhasil dan pesan error.
 */
async function runMutation(store, keys, fallbackMessage, task) {
  store[keys.pending] = true
  store[keys.done] = false
  store.errorMessage = ''

  let response
  try {
    response = await task()
    store[keys.done] = true
  } catch (error) {
    store.errorMessage = error?.message || fallbackMessage
    throw error
  } finally {
    store[keys.pending] = false
  }

  return response
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
        this.aucations = response?.data?.aucations ?? []
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
      this.aucation = null

      try {
        const response = await getAucationById(id)
        this.aucation = response?.data?.aucation ?? null
      } catch (error) {
        this.errorMessage =
          error?.message || 'Gagal mengambil detail lelang.'
        throw error
      } finally {
        this.isAucation = false
      }

      return this.aucation
    },

    addAucation(data) {
      return runMutation(
        this,
        { pending: 'isAucationAdd', done: 'isAucationAdded' },
        'Gagal menambahkan lelang.',
        () => addAucation(data),
      )
    },

    changeAucation(id, data) {
      return runMutation(
        this,
        { pending: 'isAucationChange', done: 'isAucationChanged' },
        'Gagal memperbarui data lelang.',
        () => updateAucation(id, data),
      )
    },

    changeAucationCover(id, file) {
      return runMutation(
        this,
        { pending: 'isAucationChangeCover', done: 'isAucationChangedCover' },
        'Gagal mengunggah cover lelang.',
        () => uploadAucationCover(id, file),
      )
    },

    async deleteAucation(id) {
      const response = await runMutation(
        this,
        { pending: 'isAucationDelete', done: 'isAucationDeleted' },
        'Gagal menghapus lelang.',
        () => deleteAucation(id),
      )

      this.aucations = this.aucations.filter(
        (item) => String(item.id) !== String(id),
      )

      if (String(this.aucation?.id) === String(id)) {
        this.aucation = null
      }

      return response
    },

    addBid(id, data) {
      return runMutation(
        this,
        { pending: 'isBidAdd', done: 'isBidAdded' },
        'Gagal mengajukan penawaran.',
        () => addBid(id, data),
      )
    },

    deleteBid(id) {
      return runMutation(
        this,
        { pending: 'isBidDelete', done: 'isBidDeleted' },
        'Gagal membatalkan penawaran.',
        () => deleteBid(id),
      )
    },

    async deleteAllAucations() {
      const response = await runMutation(
        this,
        { pending: 'isAucationDeleteAll', done: 'isAucationDeletedAll' },
        'Gagal menghapus seluruh lelang.',
        () => deleteAllAucations(),
      )

      this.aucations = []
      this.aucation = null

      return response
    },
  },
})
