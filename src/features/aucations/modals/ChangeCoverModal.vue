<script setup>
import { onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['close', 'submit'])
const file = ref(null)
const preview = ref('')
const error = ref('')

function clearPreview() {
  if (preview.value) {
    URL.revokeObjectURL(preview.value)
  }
  preview.value = ''
}

function reset() {
  clearPreview()
  file.value = null
  error.value = ''
}

watch(
  () => props.show,
  (visible) => {
    if (!visible) reset()
  },
)

onBeforeUnmount(clearPreview)

function selectFile(event) {
  const selected = event.target.files?.[0] ?? null
  reset()

  if (selected && !selected.type.startsWith('image/')) {
    error.value = 'File harus berupa gambar.'
    event.target.value = ''
    return
  }

  if (selected) {
    file.value = selected
    preview.value = URL.createObjectURL(selected)
  }
}

function submitForm() {
  if (!file.value) {
    error.value = 'Pilih gambar cover terlebih dahulu.'
    return
  }

  emit('submit', file.value)
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
        <h2 class="text-xl font-bold">Ubah Cover Lelang</h2>
        <button type="button" aria-label="Tutup" @click="closeModal">✕</button>
      </div>

      <label class="block text-sm font-medium">
        Pilih gambar
        <input
          type="file"
          accept="image/*"
          class="mt-2 block w-full rounded-lg border border-slate-300 p-3"
          @change="selectFile"
        />
      </label>

      <img
        v-if="preview"
        :src="preview"
        alt="Pratinjau cover"
        class="max-h-56 w-full rounded-lg object-cover"
      />

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
          {{ loading ? 'Mengunggah...' : 'Unggah Cover' }}
        </button>
      </div>
    </form>
  </div>
</template>
