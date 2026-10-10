
<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAucationsStore } from '../states/aucationsStore.js'
import NavbarComponent from '../components/NavbarComponent.vue'
import SidebarComponent from '../components/SidebarComponent.vue'
import AddModal from '../modals/AddModal.vue'

const router = useRouter()
const store = useAucationsStore()
const showAddModal = ref(false)
const search = ref('')
const filter = ref('all')
const pageError = ref('')

const filteredAucations = computed(() => {
  return store.aucations.filter((item) => {
    const matchesSearch = `${item.title ?? ''} ${item.description ?? ''}`
      .toLowerCase()
      .includes(search.value.toLowerCase())

    const closed = item.is_closed === true || (
      item.closed_at && new Date(item.closed_at).getTime() < Date.now()
    )

    const matchesFilter = filter.value === 'all'
      || (filter.value === 'closed' && closed)
      || (filter.value === 'active' && !closed)

    return matchesSearch && matchesFilter
  })
})

function formatPrice(value) {
  return Number(value ?? 0).toLocaleString('id-ID')
}

function isClosed(item) {
  return item.is_closed === true || (
    item.closed_at && new Date(item.closed_at).getTime() < Date.now()
  )
}

async function loadAucations() {
  pageError.value = ''

  try {
    await store.fetchAucations()
  } catch {
    pageError.value = store.errorMessage || 'Gagal memuat daftar lelang.'
  }
}

async function createAucation(data) {
  pageError.value = ''

  try {
    await store.addAucation(data)
    showAddModal.value = false
  } catch {
    pageError.value = store.errorMessage || 'Gagal membuat lelang.'
  }
}

function openDetail(item) {
  router.push(`/aucations/${item.id}`)
}

onMounted(loadAucations)
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <NavbarComponent />

    <div class="mx-auto flex max-w-7xl flex-col gap-6 p-4 md:flex-row md:p-8">
      <SidebarComponent />

      <main class="min-w-0 flex-1">
        <div class="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Daftar Lelang</h1>
            <p class="mt-1 text-gray-500">Temukan barang dan ajukan penawaran terbaik.</p>
          </div>

          <button type="button"
            class="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700"
            @click="showAddModal = true">
            + Buat Lelang
          </button>
        </div>

        <div class="mb-5 flex flex-col gap-3 sm:flex-row">
          <input v-model="search" type="search" placeholder="Cari lelang..."
            aria-label="Cari lelang"
            class="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white p-3 outline-none focus:border-indigo-500" />

          <select v-model="filter" aria-label="Filter lelang"
            class="rounded-xl border border-gray-200 bg-white p-3">
            <option value="all">Semua lelang</option>
            <option value="active">Masih aktif</option>
            <option value="closed">Sudah ditutup</option>
          </select>
        </div>

        <p v-if="pageError" role="alert"
          class="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {{ pageError }}
        </p>

        <div v-if="store.isAucation" class="py-12 text-center text-gray-500">
          Memuat daftar lelang...
        </div>

        <div v-else-if="filteredAucations.length === 0"
          class="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <h2 class="text-lg font-semibold text-gray-700">Belum ada lelang</h2>
          <p class="mt-2 text-sm text-gray-500">Coba ubah pencarian atau buat lelang baru.</p>
        </div>

        <div v-else class="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          <article v-for="item in filteredAucations" :key="item.id"
            class="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <img v-if="item.cover_url || item.cover"
              :src="item.cover_url || item.cover"
              :alt="`Cover ${item.title}`"
              class="h-44 w-full object-cover" />

            <div class="space-y-3 p-5">
              <div class="flex items-start justify-between gap-2">
                <h2 class="font-bold text-gray-900">{{ item.title }}</h2>
                <span class="shrink-0 rounded-full px-2 py-1 text-xs"
                  :class="isClosed(item) ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-700'">
                  {{ isClosed(item) ? 'Ditutup' : 'Aktif' }}
                </span>
              </div>

              <p class="line-clamp-3 text-sm text-gray-500">
                {{ item.description || 'Tidak ada deskripsi.' }}
              </p>

              <div class="text-sm">
                <span class="text-gray-500">Harga awal</span>
                <p class="font-bold text-indigo-600">Rp{{ formatPrice(item.start_bid) }}</p>
              </div>

              <button type="button"
                class="w-full rounded-lg border border-indigo-200 px-4 py-2 font-medium text-indigo-600 hover:bg-indigo-50"
                @click="openDetail(item)">
                Lihat Detail
              </button>
            </div>
          </article>
        </div>
      </main>
    </div>

    <AddModal :show="showAddModal" :loading="store.isAucationAdd"
      @close="showAddModal = false" @submit="createAucation" />
  </div>
</template>