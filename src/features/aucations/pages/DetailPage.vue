<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import { useAucationsStore } from '../states/aucationsStore.js'
import { useAuthStore } from '../../auth/states/authStore.js'
import { useUsersStore } from '../../users/states/usersStore.js'
import MarkdownViewer from '../components/MarkdownViewer.vue'
import ChangeModal from '../modals/ChangeModal.vue'
import ChangeCoverModal from '../modals/ChangeCoverModal.vue'
import BidModal from '../modals/BidModal.vue'
import { getAssetUrl } from '../../../helpers/apiHelper.js'
import {
  formatDate,
  formatRupiah,
  getCountdown,
  getHighestBid,
  isClosedAt,
  showConfirmDialog,
  showErrorDialog,
  showSuccessDialog,
} from '../../../helpers/toolsHelper.js'

const props = defineProps({
  aucationId: { type: [String, Number], required: true },
})

const router = useRouter()
const store = useAucationsStore()
const authStore = useAuthStore()
const usersStore = useUsersStore()

const showChangeModal = ref(false)
const showCoverModal = ref(false)
const showBidModal = ref(false)

const aucation = computed(() => store.aucation)
const closed = computed(() => isClosedAt(aucation.value?.closed_at))
const currentUserId = computed(
  () => authStore.user?.id ?? usersStore.profile?.id ?? null,
)
const isOwner = computed(
  () =>
    currentUserId.value !== null &&
    String(aucation.value?.user_id) === String(currentUserId.value),
)
const bidHistory = computed(() =>
  [...(aucation.value?.bids ?? [])].sort((a, b) => Number(b.bid) - Number(a.bid)),
)
const highestBid = computed(() => getHighestBid(aucation.value?.bids))
const currentBid = computed(
  () => highestBid.value ?? Number(aucation.value?.start_bid ?? 0),
)

async function loadDetail() {
  try {
    await store.fetchAucation(props.aucationId)
  } catch {
    await showErrorDialog('Gagal memuat detail lelang', store.errorMessage)
  }
}

/**
 * Menjalankan aksi store, lalu menampilkan dialog hasilnya.
 */
async function perform(action, successText, errorTitle) {
  try {
    await action()
    await showSuccessDialog('Berhasil', successText)
    return true
  } catch {
    await showErrorDialog(errorTitle, store.errorMessage)
    return false
  }
}

async function updateAucation(data) {
  const ok = await perform(
    () => store.changeAucation(props.aucationId, data),
    'Data lelang berhasil diperbarui.',
    'Gagal memperbarui lelang',
  )

  if (ok) {
    showChangeModal.value = false
    await loadDetail()
  }
}

async function updateCover(file) {
  const ok = await perform(
    () => store.changeAucationCover(props.aucationId, file),
    'Cover lelang berhasil diperbarui.',
    'Gagal mengunggah cover',
  )

  if (ok) {
    showCoverModal.value = false
    await loadDetail()
  }
}

async function submitBid(data) {
  const ok = await perform(
    () => store.addBid(props.aucationId, data),
    'Penawaranmu berhasil dikirim.',
    'Gagal mengajukan penawaran',
  )

  if (ok) {
    showBidModal.value = false
    await loadDetail()
  }
}

async function cancelBid() {
  const confirmed = await showConfirmDialog(
    'Batalkan penawaran?',
    'Penawaranmu pada lelang ini akan dihapus.',
    'Batalkan',
  )

  if (!confirmed) return

  const ok = await perform(
    () => store.deleteBid(props.aucationId),
    'Penawaranmu berhasil dibatalkan.',
    'Gagal membatalkan penawaran',
  )

  if (ok) await loadDetail()
}

async function removeAucation() {
  const confirmed = await showConfirmDialog(
    'Hapus lelang?',
    'Lelang ini akan dihapus permanen.',
    'Hapus',
  )

  if (!confirmed) return

  const ok = await perform(
    () => store.deleteAucation(props.aucationId),
    'Lelang berhasil dihapus.',
    'Gagal menghapus lelang',
  )

  if (ok) await router.push({ name: 'home' })
}

onMounted(async () => {
  if (!authStore.user) {
    try {
      await usersStore.fetchMyProfile()
    } catch {
      // Tombol aksi pemilik disembunyikan jika profil tidak dapat dimuat.
    }
  }

  await loadDetail()
})

watch(() => props.aucationId, loadDetail)
</script>

<template>
  <section class="mx-auto max-w-4xl">
    <button
      type="button"
      class="mb-5 flex items-center gap-1 text-sm font-medium text-indigo-600 hover:underline"
      @click="router.push({ name: 'home' })"
    >
      <ArrowLeft class="h-4 w-4" aria-hidden="true" />
      Kembali ke daftar lelang
    </button>

    <div v-if="store.isAucation" class="py-12 text-center text-slate-600" role="status">
      Memuat detail lelang...
    </div>

    <div v-else-if="!aucation" class="rounded-2xl bg-white p-8 text-center">
      <h1 class="text-xl font-bold">Lelang tidak ditemukan</h1>
    </div>

    <article
      v-else
      class="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"
    >
      <img
        v-if="aucation.cover"
        :src="getAssetUrl(aucation.cover)"
        :alt="`Cover ${aucation.title}`"
        class="max-h-96 w-full object-cover"
      />

      <div class="space-y-6 p-6 md:p-8">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 class="text-3xl font-bold text-slate-900">{{ aucation.title }}</h1>
            <p v-if="aucation.author" class="mt-2 text-sm text-slate-600">
              Oleh {{ aucation.author.name }}
            </p>
          </div>

          <span
            class="rounded-full px-3 py-1 text-sm"
            :class="
              closed
                ? 'bg-slate-100 text-slate-600'
                : 'bg-green-100 text-green-700'
            "
          >
            {{ closed ? 'Ditutup' : 'Berlangsung' }}
          </span>
        </div>

        <div class="grid gap-4 rounded-xl bg-indigo-50 p-5 sm:grid-cols-3">
          <div>
            <p class="text-sm text-slate-600">Harga awal</p>
            <p class="mt-1 text-xl font-bold text-indigo-700">
              {{ formatRupiah(aucation.start_bid) }}
            </p>
          </div>

          <div>
            <p class="text-sm text-slate-600">Tawaran tertinggi</p>
            <p class="mt-1 text-xl font-bold text-slate-900">
              {{ highestBid !== null ? formatRupiah(highestBid) : 'Belum ada' }}
            </p>
          </div>

          <div>
            <p class="text-sm text-slate-600">Batas waktu</p>
            <p class="mt-1 font-semibold text-slate-900">
              {{ formatDate(aucation.closed_at) }}
            </p>
            <p class="text-xs text-slate-600">
              {{ getCountdown(aucation.closed_at) }}
            </p>
          </div>
        </div>

        <p v-if="aucation.my_bid" class="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
          Penawaran kamu: <strong>{{ formatRupiah(aucation.my_bid.bid) }}</strong>
        </p>

        <section>
          <h2 class="mb-3 text-lg font-bold">Deskripsi</h2>
          <MarkdownViewer :content="aucation.description || ''" />
        </section>

        <section>
          <h2 class="mb-3 text-lg font-bold">Riwayat Penawaran</h2>

          <p v-if="bidHistory.length === 0" class="text-sm text-slate-600">
            Belum ada penawaran.
          </p>

          <ol v-else class="divide-y divide-slate-100 rounded-xl border border-slate-100">
            <li
              v-for="(item, index) in bidHistory"
              :key="item.id"
              class="flex items-center justify-between px-4 py-3 text-sm"
              data-testid="bid-item"
            >
              <span class="text-slate-600">
                #{{ index + 1 }} · {{ formatDate(item.created_at) }}
              </span>
              <span class="font-semibold text-slate-900">
                {{ formatRupiah(item.bid) }}
              </span>
            </li>
          </ol>
        </section>

        <div class="flex flex-wrap gap-3 border-t border-slate-100 pt-5">
          <template v-if="isOwner">
            <button
              type="button"
              class="rounded-lg border border-slate-300 px-4 py-2"
              @click="showChangeModal = true"
            >
              Ubah Lelang
            </button>

            <button
              type="button"
              class="rounded-lg border border-slate-300 px-4 py-2"
              @click="showCoverModal = true"
            >
              Ubah Cover
            </button>

            <button
              type="button"
              class="rounded-lg bg-red-50 px-4 py-2 text-red-700"
              @click="removeAucation"
            >
              Hapus Lelang
            </button>
          </template>

          <template v-else-if="!closed">
            <button
              type="button"
              class="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white"
              @click="showBidModal = true"
            >
              Ajukan Penawaran
            </button>

            <button
              v-if="aucation.my_bid"
              type="button"
              class="rounded-lg bg-red-50 px-4 py-2 text-red-700"
              @click="cancelBid"
            >
              Batalkan Penawaran
            </button>
          </template>
        </div>
      </div>
    </article>

    <ChangeModal
      :show="showChangeModal"
      :loading="store.isAucationChange"
      :aucation="aucation"
      @close="showChangeModal = false"
      @submit="updateAucation"
    />

    <ChangeCoverModal
      :show="showCoverModal"
      :loading="store.isAucationChangeCover"
      @close="showCoverModal = false"
      @submit="updateCover"
    />

    <BidModal
      :show="showBidModal"
      :loading="store.isBidAdd"
      :current-bid="currentBid"
      @close="showBidModal = false"
      @submit="submitBid"
    />
  </section>
</template>
