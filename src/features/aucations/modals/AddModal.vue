
<script setup>
import { reactive, watch } from 'vue'
import MarkdownEditor from '../components/MarkdownEditor.vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['close', 'submit'])

const form = reactive({
  title: '',
  description: '',
  start_bid: '',
  closed_at: '',
})

function resetForm() {
  Object.assign(form, {
    title: '',
    description: '',
    start_bid: '',
    closed_at: '',
  })
}

function closeModal() {
  if (!props.loading) emit('close')
}

function submitForm() {
  if (
    !form.title.trim() ||
    !form.description.trim() ||
    Number(form.start_bid) <= 0 ||
    !form.closed_at
  ) return

  emit('submit', {
    title: form.title.trim(),
    description: form.description.trim(),
    start_bid: Number(form.start_bid),
    closed_at: form.closed_at,
  })
}

watch(() => props.show, (visible) => {
  if (!visible) resetForm()
})
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    @click.self="closeModal"
  >
    <form
      class="max-h-[90vh] w-full max-w-xl space-y-4 overflow-y-auto rounded-2xl bg-white p-6"
      @submit.prevent="submitForm"
    >
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-bold text-gray-800">Buat Lelang</h2>
        <button type="button" aria-label="Tutup" @click="closeModal">✕</button>
      </div>

      <label class="block text-sm font-medium">
        Nama barang
        <input v-model="form.title" required maxlength="150"
          class="mt-1 w-full rounded-lg border p-3" placeholder="Nama barang lelang" />
      </label>

      <MarkdownEditor v-model="form.description" />

      <label class="block text-sm font-medium">
        Harga awal (Rp)
        <input v-model="form.start_bid" type="number" min="1" required
          class="mt-1 w-full rounded-lg border p-3" />
      </label>

      <label class="block text-sm font-medium">
        Waktu penutupan
        <input v-model="form.closed_at" type="datetime-local" required
          class="mt-1 w-full rounded-lg border p-3" />
      </label>

      <div class="flex justify-end gap-3">
        <button type="button" class="rounded-lg border px-4 py-2" @click="closeModal">
          Batal
        </button>
        <button type="submit" :disabled="loading"
          class="rounded-lg bg-indigo-600 px-4 py-2 text-white disabled:opacity-50">
          {{ loading ? 'Menyimpan...' : 'Buat Lelang' }}
        </button>
      </div>
    </form>
  </div>
</template>