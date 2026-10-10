import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const port = Number(env.APP_PORT || env.PORT) || 3000

  return {
    plugins: [vue(), tailwindcss()],
    server: {
      host: true, // 0.0.0.0, agar bisa diakses via 127.0.0.1 / IPv4 / hostname lain
      port,
      strictPort: true, // gagal jelas jika port bentrok, bukan pindah diam-diam
      allowedHosts: true,
    },
    preview: {
      host: true,
      port,
      strictPort: true,
      allowedHosts: true,
    },
    define: {
      DELCOM_BASEURL: JSON.stringify(
        env.VITE_DELCOM_BASEURL || 'https://open-api.delcom.org/api/v1',
      ),
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/setupTests.js'],
      coverage: {
        provider: 'v8',
        include: ['src/**/*.{js,vue}'],
        exclude: [
          'src/main.js',
          'src/setupTests.js',
          'src/test-utils.js',
          'src/**/*.test.js',
        ],
        thresholds: {
          statements: 100,
          branches: 100,
          functions: 100,
          lines: 100,
        },
      },
    },
  }
})
