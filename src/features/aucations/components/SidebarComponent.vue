
<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const emit = defineEmits(['navigate'])

function navigateTo(path) {
  emit('navigate', path)
  router.push(path)
}
</script>

<template>
  <aside class="w-full rounded-xl border border-gray-200 bg-white p-4 md:w-60">
    <h2 class="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
      Menu
    </h2>

    <nav class="space-y-2">
      <button
        type="button"
        class="block w-full rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"
        @click="navigateTo('/')"
      >
        <span class="mr-2" aria-hidden="true">⌂</span>
        Daftar Lelang
      </button>

      <button
        type="button"
        class="block w-full rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"
        @click="navigateTo('/aucations/my')"
      >
        <span class="mr-2" aria-hidden="true">▤</span>
        Lelang Saya
      </button>
    </nav>
  </aside>
</template>