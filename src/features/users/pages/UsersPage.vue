<script setup>
import { onMounted } from 'vue'
import { useUsersStore } from '../states/usersStore.js'
import { getAssetUrl } from '../../../helpers/apiHelper.js'

const usersStore = useUsersStore()

onMounted(async () => {
  try {
    await usersStore.fetchUsers()
  } catch {
    // Pesan error sudah disimpan di usersStore.
  }
})
</script>

<template>
  <div>
    <section>
      <header class="mb-8">
        <h1 class="text-3xl font-bold text-slate-900">Direktori Pengguna</h1>
        <p class="mt-2 text-slate-600">
          Daftar pengguna yang terdaftar di sistem.
        </p>
      </header>

      <div
        v-if="usersStore.isLoadingUsers"
        class="rounded-2xl bg-white p-8 text-center text-slate-600 shadow-sm"
        role="status"
      >
        Memuat daftar pengguna...
      </div>

      <div
        v-else-if="usersStore.errorMessage"
        class="rounded-2xl bg-white p-8 text-center shadow-sm"
      >
        <p class="text-red-700" role="alert">
          {{ usersStore.errorMessage }}
        </p>

        <button
          type="button"
          class="mt-4 rounded-xl bg-indigo-700 px-4 py-2 font-semibold text-white hover:bg-indigo-800"
          @click="usersStore.fetchUsers().catch(() => {})"
        >
          Coba lagi
        </button>
      </div>

      <div
        v-else-if="usersStore.users.length === 0"
        class="rounded-2xl bg-white p-8 text-center text-slate-600 shadow-sm"
      >
        Belum ada data pengguna yang dapat ditampilkan.
      </div>

      <div v-else class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="user in usersStore.users"
          :key="user.id"
          class="rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
        >
          <div class="flex items-center gap-4">
            <img
              v-if="user.photo"
              :src="getAssetUrl(user.photo)"
              :alt="`Foto ${user.name}`"
              class="h-14 w-14 rounded-full object-cover"
            />

            <div
              v-else
              class="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xl font-bold text-indigo-700"
              aria-hidden="true"
            >
              {{ (user.name || 'U').charAt(0).toUpperCase() }}
            </div>

            <div class="min-w-0">
              <h2 class="truncate font-bold text-slate-900">
                {{ user.name || 'Nama tidak tersedia' }}
              </h2>
              <p class="break-all text-sm text-slate-500">
                {{ user.email || 'Email tidak tersedia' }}
              </p>
            </div>
          </div>

          <div class="mt-5 border-t border-slate-100 pt-4">
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Informasi pengguna
            </p>
            <p class="mt-2 text-sm text-slate-600">
              {{ user.email_verified_at ? 'Email terverifikasi' : 'Pengguna terdaftar' }}
            </p>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>
