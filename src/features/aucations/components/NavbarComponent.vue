
<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function goHome() {
  router.push('/')
}

function logout() {
  localStorage.removeItem('accessToken')
  router.push('/login')
}
</script>

<template>
  <header class="flex items-center justify-between border-b border-gray-200 bg-white px-5 py-4">
    <button
      type="button"
      class="text-xl font-bold text-indigo-600"
      aria-label="Beranda"
      @click="goHome"
    >
      AuctionHub
    </button>

    <nav class="flex items-center gap-3">
      <button
        type="button"
        class="rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
        @click="goHome"
      >
        Beranda
      </button>

      <button
        type="button"
        class="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
        @click="logout"
      >
        Keluar
      </button>
    </nav>
  </header>
</template>