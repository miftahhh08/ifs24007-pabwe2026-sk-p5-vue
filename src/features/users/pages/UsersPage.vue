
<script setup>
import { onMounted } from 'vue'
import { useUsersStore } from '../states/usersStore.js'

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
  <main class="min-h-screen bg-slate-100 p-4 sm:p-8">
    <section class="mx-auto max-w-6xl">
      <header class="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p class="text-sm font-semibold uppercase tracking-widest text-blue-700">
            Student Portal
          </p>
          <h1 class="mt-2 text-3xl font-bold text-slate-900">
            Direktori Pengguna
          </h1>
          <p class="mt-2 text-slate-600">
            Daftar pengguna yang terdaftar di sistem.
          </p>
        </div>

        <RouterLink
          to="/profile"
          class="rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800"
        >
          Profil Saya
        </RouterLink>
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
          class="mt-4 rounded-xl bg-blue-700 px-4 py-2 font-semibold text-white hover:bg-blue-800"
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
          v-for="(user, index) in usersStore.users"
          :key="user.id ?? user.userId ?? user.email ?? index"
          class="rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
        >
          <div class="flex items-center gap-4">
            <img
              v-if="user.photo || user.avatar || user.profilePhoto"
              :src="user.photo || user.avatar || user.profilePhoto"
              :alt="`Foto ${user.name || user.fullName || 'pengguna'}`"
              class="h-14 w-14 rounded-full object-cover"
            />

            <div
              v-else
              class="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-700"
              aria-hidden="true"
            >
              {{ (user.name || user.fullName || user.email || 'U').charAt(0).toUpperCase() }}
            </div>

            <div class="min-w-0">
              <h2 class="truncate font-bold text-slate-900">
                {{ user.name || user.fullName || 'Nama tidak tersedia' }}
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
              {{ user.role || user.position || 'Pengguna terdaftar' }}
            </p>
          </div>
        </article>
      </div>
    </section>
  </main>
</template>