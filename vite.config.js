import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
plugins: [vue(), tailwindcss()],
define: {
DELCOM_BASEURL: JSON.stringify(
process.env.DELCOM_BASEURL || 'https://open-api.delcom.org/api/v1',
),
},
test: {
globals: true,
environment: 'jsdom',
setupFiles: ['./src/setupTests.js'],
coverage: {
provider: 'v8',
include: ['src/**/*.{js,ts,vue}'],
exclude: [
'src/setupTests.js',
'src/**/*.test.js',
'src/**/**tests**/**',
],
thresholds: {
statements: 100,
branches: 100,
functions: 100,
lines: 100,
},
},
},
})
