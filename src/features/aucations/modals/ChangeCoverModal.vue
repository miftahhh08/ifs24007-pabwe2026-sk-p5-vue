
<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['close', 'submit'])
const file = ref(null)
const error = ref('')

watch(() => props.show, (visible) => {
  if (!visible) {
    file.value = null
    error.value = ''
  }
})

function selectFile(event) {
  const selected = event.target.files?.[0] ?? null
  error.value = ''

  if (selected && !selected.type.startsWith('image/')) {
    error.value = 'File harus berupa gambar.'
    file.value = null
    event.target.value = ''
    return
  }

  file.value = selected
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
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    @click.self="closeModal">
    <form class="w-full max-w-md space-y-4 rounded-2xl bg-white p-6" @submit.prevent="submitForm">
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-bold">Ubah Cover Lelang</h2>
        <button type="button" aria-label="Tutup" @click="closeModal">✕</button>
      </div>

      <label class="block text-sm font-medium">
        Pilih gambar
        <input type="file" accept="image/*" class="mt-2 block w-full rounded-lg border p-3"
          @change="selectFile" />
      </label>

      <p v-if="file" class="text-sm text-gray-600">{{ file.name }}</p>
      <p v-if="error" role="alert" class="text-sm text-red-600">{{ error }}</p>

      <div class="flex justify-end gap-3">
        <button type="button" class="rounded-lg border px-4 py-2" @click="closeModal">Batal</button>
        <button type="submit" :disabled="loading" class="rounded-lg bg-indigo-600 px-4 py-2 text-white disabled:opacity-50">
          {{ loading ? 'Mengunggah...' : 'Unggah Cover' }}
        </button>
      </div>
    </form>
  </div>
</template>