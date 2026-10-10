<script setup>
import { ref, watch } from 'vue'
import { formatRupiah } from '../../../helpers/toolsHelper.js'

const props = defineProps({
  show: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  currentBid: { type: Number, default: 0 },
})

const emit = defineEmits(['close', 'submit'])
const amount = ref('')
const error = ref('')

watch(
  () => props.show,
  (visible) => {
    if (visible) {
      amount.value = ''
      error.value = ''
    }
  },
)

function submitForm() {
  const bid = Number(amount.value)

  if (!Number.isFinite(bid) || bid <= props.currentBid) {
    error.value = `Penawaran harus lebih tinggi dari ${formatRupiah(props.currentBid)}.`
    return
  }

  error.value = ''
  emit('submit', { bid })
}

function closeModal() {
  if (!props.loading) emit('close')
}
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    @click.self="closeModal"
  >
    <form
      class="w-full max-w-md space-y-4 rounded-2xl bg-white p-6"
      @submit.prevent="submitForm"
    >
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-bold">Ajukan Penawaran</h2>
        <button type="button" aria-label="Tutup" @click="closeModal">✕</button>
      </div>

      <p class="text-sm text-slate-600">
        Penawaran tertinggi saat ini:
        <strong>{{ formatRupiah(currentBid) }}</strong>
      </p>

      <label class="block text-sm font-medium">
        Penawaran kamu (Rp)
        <input
          v-model="amount"
          type="number"
          min="1"
          class="mt-1 w-full rounded-lg border border-slate-300 p-3"
          placeholder="Masukkan penawaran"
        />
      </label>

      <p v-if="error" role="alert" class="text-sm text-red-700">{{ error }}</p>

      <div class="flex justify-end gap-3">
        <button
          type="button"
          class="rounded-lg border border-slate-300 px-4 py-2"
          @click="closeModal"
        >
          Batal
        </button>
        <button
          type="submit"
          :disabled="loading"
          class="rounded-lg bg-indigo-600 px-4 py-2 text-white disabled:opacity-50"
        >
          {{ loading ? 'Mengirim...' : 'Kirim Penawaran' }}
        </button>
      </div>
    </form>
  </div>
</template>
