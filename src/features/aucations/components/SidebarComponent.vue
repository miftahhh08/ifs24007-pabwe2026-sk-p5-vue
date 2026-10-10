<script setup>
import { useRoute } from 'vue-router'
import { LayoutDashboard, Gavel, Users, UserRound, X } from 'lucide-vue-next'

defineProps({
  open: { type: Boolean, default: false },
})

const emit = defineEmits(['close'])

const route = useRoute()

const menus = [
  { label: 'Dashboard Lelang', to: '/', icon: LayoutDashboard, filter: undefined },
  { label: 'Lelang Saya', to: '/?filter=mine', icon: Gavel, filter: 'mine' },
  { label: 'Daftar Pengguna', to: '/users', icon: Users },
  { label: 'Profil Saya', to: '/profile', icon: UserRound },
]

function isActive(menu) {
  if (menu.to.startsWith('/?') || menu.to === '/') {
    return route.path === '/' && route.query.filter === menu.filter
  }

  return route.path === menu.to
}
</script>

<template>
  <div>
    <div
      v-if="open"
      class="fixed inset-0 z-30 bg-black/40 md:hidden"
      data-testid="sidebar-overlay"
      @click="emit('close')"
    />

    <aside
      class="fixed inset-y-0 left-0 z-40 w-64 transform border-r border-slate-200 bg-white p-4 transition-transform md:static md:z-auto md:translate-x-0 md:rounded-2xl md:border"
      :class="open ? 'translate-x-0' : '-translate-x-full'"
      data-testid="sidebar"
    >
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Menu
        </h2>

        <button
          type="button"
          class="rounded-lg p-1 text-slate-500 hover:bg-slate-100 md:hidden"
          aria-label="Tutup menu"
          @click="emit('close')"
        >
          <X class="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <nav class="space-y-1">
        <RouterLink
          v-for="menu in menus"
          :key="menu.to"
          :to="menu.to"
          class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium"
          :class="
            isActive(menu)
              ? 'bg-indigo-50 text-indigo-700'
              : 'text-slate-600 hover:bg-slate-50'
          "
          @click="emit('close')"
        >
          <component :is="menu.icon" class="h-4 w-4" aria-hidden="true" />
          {{ menu.label }}
        </RouterLink>
      </nav>
    </aside>
  </div>
</template>
