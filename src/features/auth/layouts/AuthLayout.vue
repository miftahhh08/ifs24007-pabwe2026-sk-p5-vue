<script setup>
import { Gavel } from 'lucide-vue-next'
</script>

<template>
  <div class="grid min-h-screen bg-slate-50 lg:grid-cols-2">
    <aside
      class="hidden flex-col justify-between bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-600 p-12 text-white lg:flex"
      data-testid="auth-banner"
    >
      <div class="flex items-center gap-3 text-2xl font-extrabold">
        <Gavel class="h-8 w-8" aria-hidden="true" />
        Delcom Auction
      </div>

      <div>
        <p class="text-4xl font-extrabold leading-tight">
          Temukan barang impian,<br />
          ajukan penawaran terbaikmu.
        </p>
        <p class="mt-4 max-w-md text-indigo-100">
          Platform lelang Delcom untuk membuat, memantau, dan memenangkan
          lelang secara mudah dan transparan.
        </p>
      </div>

      <p class="text-sm text-indigo-200">Delcom Auction &copy; 2026</p>
    </aside>

    <main class="flex items-center justify-center p-6 sm:p-10">
      <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-sm sm:p-8">
        <RouterView />
      </div>
    </main>
  </div>
</template>
