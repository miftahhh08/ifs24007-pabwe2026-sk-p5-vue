<script setup>
import { useRouter } from 'vue-router'
import { Gavel, LogOut, Menu } from 'lucide-vue-next'
import { useAuthStore } from '../../auth/states/authStore.js'
import { showConfirmDialog } from '../../../helpers/toolsHelper.js'

defineEmits(['toggle-sidebar'])

const router = useRouter()
const authStore = useAuthStore()

async function handleLogout() {
  const confirmed = await showConfirmDialog(
    'Keluar dari akun?',
    'Kamu perlu login kembali untuk mengakses lelang.',
    'Keluar',
  )

  if (!confirmed) {
    return
  }

  await authStore.logout()
  await router.push({ name: 'login' })
}
</script>

<template>
  <header
    class="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 sm:px-8"
  >
    <div class="flex items-center gap-3">
      <button
        type="button"
        class="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
        aria-label="Buka menu"
        @click="$emit('toggle-sidebar')"
      >
        <Menu class="h-5 w-5" aria-hidden="true" />
      </button>

      <RouterLink
        to="/"
        class="flex items-center gap-2 text-lg font-extrabold text-indigo-600"
      >
        <Gavel class="h-6 w-6" aria-hidden="true" />
        Delcom Auction
      </RouterLink>
    </div>

    <div class="flex items-center gap-3">
      <span
        v-if="authStore.user"
        class="hidden text-sm font-medium text-slate-600 sm:inline"
        data-testid="navbar-user"
      >
        {{ authStore.user.name }}
      </span>

      <button
        type="button"
        class="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-100"
        @click="handleLogout"
      >
        <LogOut class="h-4 w-4" aria-hidden="true" />
        Keluar
      </button>
    </div>
  </header>
</template>
