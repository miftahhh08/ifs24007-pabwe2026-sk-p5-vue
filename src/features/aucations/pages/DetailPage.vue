
<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAucationsStore } from '../states/aucationsStore.js'
import NavbarComponent from '../components/NavbarComponent.vue'
import MarkdownViewer from '../components/MarkdownViewer.vue'
import ChangeModal from '../modals/ChangeModal.vue'
import ChangeCoverModal from '../modals/ChangeCoverModal.vue'
import BidModal from '../modals/BidModal.vue'

const route = useRoute()
const router = useRouter()
const store = useAucationsStore()

const pageError = ref('')
const showChangeModal = ref(false)
const showCoverModal = ref(false)
const showBidModal = ref(false)

const aucation = computed(() => store.aucation)

const closed = computed(() => {
  const item = aucation.value

  return !item || item.is_closed === true || (
    item.closed_at && new Date(item.closed_at).getTime() < Date.now()
  )
})

function formatPrice(value) {
  return Number(value ?? 0).toLocaleString('id-ID')
}

async function loadDetail() {
  pageError.value = ''

  try {
    await store.fetchAucation(route.params.id)
  } catch {
    pageError.value = store.errorMessage || 'Gagal memuat detail lelang.'
  }
}

async function updateAucation(data) {
  pageError.value = ''

  try {
    await store.changeAucation(route.params.id, data)
    showChangeModal.value = false
  } catch {
    pageError.value = store.errorMessage || 'Gagal memperbarui lelang.'
  }
}

async function updateCover(file) {
  pageError.value = ''

  try {
    await store.changeAucationCover(route.params.id, file)
    showCoverModal.value = false
  } catch {
    pageError.value = store.errorMessage || 'Gagal mengunggah cover.'
  }
}

async function submitBid(data) {
  pageError.value = ''

  try {
    await store.addBid(route.params.id, data)
    showBidModal.value = false
    await loadDetail()
  } catch {
    pageError.value = store.errorMessage || 'Gagal mengajukan penawaran.'
  }
}

async function removeAucation() {
  const confirmed = window.confirm('Yakin ingin menghapus lelang ini?')

  if (!confirmed) return

  pageError.value = ''

  try {
    await store.deleteAucation(route.params.id)
    router.push('/')
  } catch {
    pageError.value = store.errorMessage || 'Gagal menghapus lelang.'
  }
}

onMounted(loadDetail)
watch(() => route.params.id, loadDetail)
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <NavbarComponent />

    <main class="mx-auto max-w-4xl p-4 md:p-8">
      <button type="button" class="mb-5 text-sm font-medium text-indigo-600 hover:underline"
        @click="router.push('/')">
        ← Kembali ke daftar lelang
      </button>

      <p v-if="pageError" role="alert"
        class="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
        {{ pageError }}
      </p>

      <div v-if="store.isAucation && !aucation" class="py-12 text-center text-gray-500">
        Memuat detail lelang...
      </div>

      <div v-else-if="!aucation" class="rounded-2xl bg-white p-8 text-center">
        <h1 class="text-xl font-bold">Lelang tidak ditemukan</h1>
        <button type="button" class="mt-4 text-indigo-600" @click="router.push('/')">
          Kembali ke beranda
        </button>
      </div>

      <article v-else class="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <img v-if="aucation.cover_url || aucation.cover"
          :src="aucation.cover_url || aucation.cover"
          :alt="`Cover ${aucation.title}`"
          class="max-h-96 w-full object-cover" />

        <div class="space-y-6 p-6 md:p-8">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 class="text-3xl font-bold text-gray-900">{{ aucation.title }}</h1>
              <p class="mt-2 text-sm text-gray-500">
                {{ closed ? 'Lelang telah ditutup' : 'Lelang masih aktif' }}
              </p>
            </div>

            <span class="rounded-full px-3 py-1 text-sm"
              :class="closed ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-700'">
              {{ closed ? 'Ditutup' : 'Aktif' }}
            </span>
          </div>

          <div class="rounded-xl bg-indigo-50 p-5">
            <p class="text-sm text-gray-600">Harga awal</p>
            <p class="mt-1 text-2xl font-bold text-indigo-700">
              Rp{{ formatPrice(aucation.start_bid) }}
            </p>

            <template v-if="aucation.current_bid != null">
              <p class="mt-3 text-sm text-gray-600">Penawaran saat ini</p>
              <p class="text-xl font-semibold text-gray-900">
                Rp{{ formatPrice(aucation.current_bid) }}
              </p>
            </template>

            <p v-if="aucation.closed_at" class="mt-3 text-xs text-gray-500">
              Ditutup: {{ new Date(aucation.closed_at).toLocaleString('id-ID') }}
            </p>
          </div>

          <section>
            <h2 class="mb-3 text-lg font-bold">Deskripsi</h2>
            <MarkdownViewer :content="aucation.description || ''" />
          </section>

          <div class="flex flex-wrap gap-3 border-t pt-5">
            <button v-if="!closed" type="button"
              class="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white"
              @click="showBidModal = true">
              Ajukan Penawaran
            </button>

            <button type="button" class="rounded-lg border px-4 py-2"
              @click="showChangeModal = true">
              Ubah Lelang
            </button>

            <button type="button" class="rounded-lg border px-4 py-2"
              @click="showCoverModal = true">
              Ubah Cover
            </button>

            <button type="button" class="rounded-lg bg-red-50 px-4 py-2 text-red-600"
              @click="removeAucation">
              Hapus Lelang
            </button>
          </div>
        </div>
      </article>
    </main>

    <ChangeModal :show="showChangeModal" :loading="store.isAucationChange"
      :aucation="aucation" @close="showChangeModal = false" @submit="updateAucation" />

    <ChangeCoverModal :show="showCoverModal" :loading="store.isAucationChangeCover"
      @close="showCoverModal = false" @submit="updateCover" />

    <BidModal :show="showBidModal" :loading="store.isBidAdd"
      :aucation="aucation" @close="showBidModal = false" @submit="submitBid" />
  </div>
</template>