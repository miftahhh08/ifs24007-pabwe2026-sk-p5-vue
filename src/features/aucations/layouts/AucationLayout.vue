<script setup>
import { ref } from 'vue'
import NavbarComponent from '../components/NavbarComponent.vue'
import SidebarComponent from '../components/SidebarComponent.vue'

const isSidebarOpen = ref(false)
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <NavbarComponent @toggle-sidebar="isSidebarOpen = !isSidebarOpen" />

    <div class="mx-auto flex max-w-7xl gap-6 p-4 md:p-8">
      <SidebarComponent :open="isSidebarOpen" @close="isSidebarOpen = false" />

      <main class="min-w-0 flex-1">
        <RouterView />
      </main>
    </div>
  </div>
</template>
