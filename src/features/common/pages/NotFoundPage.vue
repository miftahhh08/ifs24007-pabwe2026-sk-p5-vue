<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <main class="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
    <p class="text-8xl font-bold text-indigo-600">404</p>

    <h1 class="mt-4 text-2xl font-bold text-gray-900">
      Halaman Tidak Ditemukan
    </h1>

    <p class="mt-2 text-gray-600">
      Maaf, halaman yang kamu cari tidak tersedia atau sudah dipindahkan.
    </p>

    <button
      type="button"
      class="mt-6 rounded-lg bg-indigo-600 px-5 py-3 font-medium text-white hover:bg-indigo-700"
      @click="router.push('/')"
    >
      Kembali ke Beranda
    </button>
  </main>
</template>
