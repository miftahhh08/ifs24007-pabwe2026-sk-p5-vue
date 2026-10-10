
<script setup>
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import Swal from 'sweetalert2'
import { useAuthStore } from '../states/authStore.js'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const isPasswordVisible = ref(false)
const validationMessage = ref('')

async function handleLogin() {
  validationMessage.value = ''

  if (!email.value.trim() || !password.value) {
    validationMessage.value = 'Email dan kata sandi wajib diisi.'
    return
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
    validationMessage.value = 'Masukkan alamat email yang valid.'
    return
  }

  try {
    await authStore.login({
      email: email.value.trim(),
      password: password.value,
    })

    await Swal.fire({
      icon: 'success',
      title: 'Login berhasil',
      text: 'Kamu berhasil masuk ke akun.',
      confirmButtonText: 'Lanjutkan',
    })

    await router.push('/')
  } catch (error) {
    await Swal.fire({
      icon: 'error',
      title: 'Login gagal',
      text:
        error?.message ||
        authStore.errorMessage ||
        'Periksa kembali email dan kata sandimu.',
      confirmButtonText: 'Mengerti',
    })
  }
}
</script>

<template>
  <div>
    <p class="text-sm font-semibold uppercase tracking-widest text-blue-700">
      Student Portal
    </p>

    <h2 class="mt-3 text-3xl font-bold text-slate-900">
      Masuk ke akun
    </h2>

    <p class="mt-2 text-sm leading-6 text-slate-500">
      Masukkan email dan kata sandi untuk melanjutkan.
    </p>

    <form class="mt-8 space-y-5" @submit.prevent="handleLogin">
      <div>
        <label for="login-email-input" class="mb-2 block text-sm font-medium text-slate-700">
          Email
        </label>

        <input
          id="login-email-input"
          v-model="email"
          type="email"
          autocomplete="email"
          placeholder="nama@email.com"
          class="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div>
        <label for="login-password-input" class="mb-2 block text-sm font-medium text-slate-700">
          Kata sandi
        </label>

        <div class="flex overflow-hidden rounded-xl border border-slate-300 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100">
          <input
            id="login-password-input"
            v-model="password"
            :type="isPasswordVisible ? 'text' : 'password'"
            autocomplete="current-password"
            placeholder="Masukkan kata sandi"
            class="min-w-0 flex-1 px-4 py-3 outline-none"
          />

          <button
            type="button"
            class="px-4 text-sm font-medium text-blue-700"
            @click="isPasswordVisible = !isPasswordVisible"
          >
            {{ isPasswordVisible ? 'Sembunyikan' : 'Lihat' }}
          </button>
        </div>
      </div>

      <p
        v-if="validationMessage"
        role="alert"
        class="rounded-lg bg-red-50 p-3 text-sm text-red-700"
      >
        {{ validationMessage }}
      </p>

      <button
        id="login-submit-button"
        type="submit"
        :disabled="authStore.isAuthLogin"
        class="w-full rounded-xl bg-blue-700 px-4 py-3 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {{ authStore.isAuthLogin ? 'Sedang masuk...' : 'Masuk' }}
      </button>
    </form>

    <p class="mt-6 text-center text-sm text-slate-600">
      Belum punya akun?
      <RouterLink
        to="/register"
        class="font-semibold text-blue-700 hover:underline"
      >
        Daftar sekarang
      </RouterLink>
    </p>
  </div>
</template>


