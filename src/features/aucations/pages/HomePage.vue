<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Plus, Search, Trash2 } from 'lucide-vue-next'
import { useAucationsStore } from '../states/aucationsStore.js'
import AddModal from '../modals/AddModal.vue'
import { getAssetUrl } from '../../../helpers/apiHelper.js'
import {
  formatRupiah,
  getCountdown,
  getHighestBid,
  isClosedAt,
  showConfirmDialog,
  showErrorDialog,
  showSuccessDialog,
} from '../../../helpers/toolsHelper.js'

const TABS = [
  { key: 'all', label: 'Semua Lelang' },
  { key: 'mine', label: 'Lelang Saya' },
  { key: 'active', label: 'Lelang Berlangsung' },
  { key: 'closed', label: 'Lelang Ditutup' },
]

const route = useRoute()
const router = useRouter()
const store = useAucationsStore()

const showAddModal = ref(false)
const search = ref('')
const now = ref(Date.now())
let timer = null

function tabFromQuery(value) {
  return TABS.some((item) => item.key === value) ? value : 'all'
}

const tab = ref(tabFromQuery(route.query.filter))

const filteredAucations = computed(() => {
  const keyword = search.value.trim().toLowerCase()

  return store.aucations.filter((item) => {
    const matchesSearch = `${item.title ?? ''} ${item.description ?? ''}`
      .toLowerCase()
      .includes(keyword)

    const closed = isClosedAt(item.closed_at, now.value)

    const matchesTab =
      tab.value === 'all' ||
      tab.value === 'mine' ||
      (tab.value === 'closed' && closed) ||
      (tab.value === 'active' && !closed)

    return matchesSearch && matchesTab
  })
})

async function loadAucations() {
  try {
    await store.fetchAucations(tab.value === 'mine' ? { is_me: 1 } : {})
  } catch {
    await showErrorDialog('Gagal memuat lelang', store.errorMessage)
  }
}

function selectTab(key) {
  router.replace({ query: key === 'all' ? {} : { filter: key } })
}

watch(
  () => route.query.filter,
  (value) => {
    tab.value = tabFromQuery(value)
  },
)

watch(tab, loadAucations)

async function createAucation(data) {
  try {
    await store.addAucation(data)
    showAddModal.value = false
    await showSuccessDialog('Berhasil', 'Lelang baru berhasil dibuat.')
    await loadAucations()
  } catch {
    await showErrorDialog('Gagal membuat lelang', store.errorMessage)
  }
}

async function removeAucation(item) {
  const confirmed = await showConfirmDialog(
    'Hapus lelang?',
    `Lelang "${item.title}" akan dihapus permanen.`,
    'Hapus',
  )

  if (!confirmed) return

  try {
    await store.deleteAucation(item.id)
    await showSuccessDialog('Berhasil', 'Lelang berhasil dihapus.')
  } catch {
    await showErrorDialog('Gagal menghapus lelang', store.errorMessage)
  }
}

async function removeAllAucations() {
  const confirmed = await showConfirmDialog(
    'Hapus semua lelang saya?',
    'Seluruh lelang milikmu beserta cover dan tawarannya akan dihapus permanen.',
    'Hapus semua',
  )

  if (!confirmed) return

  try {
    await store.deleteAllAucations()
    await showSuccessDialog('Berhasil', 'Seluruh lelang milikmu telah dihapus.')
  } catch {
    await showErrorDialog('Gagal menghapus lelang', store.errorMessage)
  }
}

function highestBidOf(item) {
  return getHighestBid(item.bids)
}

onMounted(() => {
  timer = setInterval(() => {
    now.value = Date.now()
  }, 30000)

  loadAucations()
})

onUnmounted(() => clearInterval(timer))
</script>

<template>
  <section>
    <div class="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 class="text-3xl font-bold text-slate-900">Dashboard Lelang</h1>
        <p class="mt-1 text-slate-500">
          Temukan barang dan ajukan penawaran terbaik.
        </p>
      </div>

      <button
        type="button"
        class="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700"
        @click="showAddModal = true"
      >
        <Plus class="h-5 w-5" aria-hidden="true" />
        Buat Lelang
      </button>
    </div>

    <div class="mb-4 flex flex-wrap gap-2" role="tablist">
      <button
        v-for="item in TABS"
        :key="item.key"
        type="button"
        role="tab"
        :aria-selected="tab === item.key"
        class="rounded-full px-4 py-2 text-sm font-semibold"
        :class="
          tab === item.key
            ? 'bg-indigo-600 text-white'
            : 'bg-white text-slate-600 hover:bg-slate-100'
        "
        @click="selectTab(item.key)"
      >
        {{ item.label }}
      </button>
    </div>

    <div class="mb-5 flex flex-col gap-3 sm:flex-row">
      <div class="relative flex-1">
        <Search
          class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />
        <input
          v-model="search"
          type="search"
          placeholder="Cari judul atau deskripsi lelang..."
          aria-label="Cari lelang"
          class="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 outline-none focus:border-indigo-500"
        />
      </div>

      <button
        v-if="tab === 'mine' && store.aucations.length > 0"
        type="button"
        class="flex items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-100"
        @click="removeAllAucations"
      >
        <Trash2 class="h-4 w-4" aria-hidden="true" />
        Hapus Semua Lelang Saya
      </button>
    </div>

    <div v-if="store.isAucation" class="py-12 text-center text-slate-500" role="status">
      Memuat daftar lelang...
    </div>

    <div
      v-else-if="filteredAucations.length === 0"
      class="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center"
    >
      <h2 class="text-lg font-semibold text-slate-700">Belum ada lelang</h2>
      <p class="mt-2 text-sm text-slate-500">
        Coba ubah pencarian atau buat lelang baru.
      </p>
    </div>

    <div v-else class="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      <article
        v-for="item in filteredAucations"
        :key="item.id"
        class="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
        data-testid="aucation-card"
      >
        <img
          v-if="item.cover"
          :src="getAssetUrl(item.cover)"
          :alt="`Cover ${item.title}`"
          class="h-44 w-full object-cover"
        />
        <div
          v-else
          class="flex h-44 items-center justify-center bg-slate-100 text-sm text-slate-400"
        >
          Belum ada cover
        </div>

        <div class="space-y-3 p-5">
          <div class="flex items-start justify-between gap-2">
            <h2 class="font-bold text-slate-900">{{ item.title }}</h2>
            <span
              class="shrink-0 rounded-full px-2 py-1 text-xs"
              :class="
                isClosedAt(item.closed_at, now)
                  ? 'bg-slate-100 text-slate-600'
                  : 'bg-green-100 text-green-700'
              "
            >
              {{ isClosedAt(item.closed_at, now) ? 'Ditutup' : 'Berlangsung' }}
            </span>
          </div>

          <p class="line-clamp-2 text-sm text-slate-500">
            {{ item.description || 'Tidak ada deskripsi.' }}
          </p>

          <dl class="grid grid-cols-2 gap-2 text-sm">
            <div>
              <dt class="text-slate-500">Harga awal</dt>
              <dd class="font-bold text-indigo-600">
                {{ formatRupiah(item.start_bid) }}
              </dd>
            </div>
            <div>
              <dt class="text-slate-500">Tawaran tertinggi</dt>
              <dd class="font-bold text-slate-800">
                {{
                  highestBidOf(item) !== null
                    ? formatRupiah(highestBidOf(item))
                    : `${item.bids?.length ?? 0} tawaran`
                }}
              </dd>
            </div>
          </dl>

          <p class="text-xs text-slate-500">
            {{ getCountdown(item.closed_at, now) }}
          </p>

          <div class="flex gap-2">
            <button
              type="button"
              class="flex-1 rounded-lg border border-indigo-200 px-4 py-2 font-medium text-indigo-600 hover:bg-indigo-50"
              @click="router.push({ name: 'detail-aucation', params: { aucationId: item.id } })"
            >
              Lihat Detail
            </button>

            <button
              v-if="tab === 'mine'"
              type="button"
              class="rounded-lg bg-red-50 px-3 text-red-600 hover:bg-red-100"
              :aria-label="`Hapus ${item.title}`"
              @click="removeAucation(item)"
            >
              <Trash2 class="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </article>
    </div>

    <AddModal
      :show="showAddModal"
      :loading="store.isAucationAdd"
      @close="showAddModal = false"
      @submit="createAucation"
    />
  </section>
</template>
