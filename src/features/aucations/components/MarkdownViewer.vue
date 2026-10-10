
<script setup>
import { computed } from 'vue'

const props = defineProps({
  content: {
    type: String,
    default: '',
  },
})

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function renderInline(value) {
  return escapeHtml(value)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
}

const renderedContent = computed(() => {
  if (!props.content.trim()) {
    return ''
  }

  return props.content
    .split('\n')
    .map((line) => {
      const heading = line.match(/^(#{1,3})\s+(.+)$/)

      if (heading) {
        const level = heading[1].length
        const text = renderInline(heading[2])

        return `<h${level}>${text}</h${level}>`
      }

      if (/^\s*[-*]\s+/.test(line)) {
        return `<li>${renderInline(line.replace(/^\s*[-*]\s+/, ''))}</li>`
      }

      if (!line.trim()) {
        return '<br>'
      }

      return `<p>${renderInline(line)}</p>`
    })
    .join('')
    .replace(/(<li>.*?<\/li>)+/gs, '<ul>$&</ul>')
})
</script>

<template>
  <div
    v-if="renderedContent"
    class="markdown-viewer break-words text-gray-700"
    v-html="renderedContent"
  />

  <p v-else class="text-sm italic text-gray-400">
    Belum ada deskripsi.
  </p>
</template>

<style scoped>
.markdown-viewer :deep(h1) {
  margin: 1rem 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.markdown-viewer :deep(h2) {
  margin: 0.75rem 0;
  font-size: 1.25rem;
  font-weight: 700;
}

.markdown-viewer :deep(h3) {
  margin: 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.markdown-viewer :deep(p) {
  margin: 0.5rem 0;
  white-space: pre-wrap;
}

.markdown-viewer :deep(ul) {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
  list-style: disc;
}

.markdown-viewer :deep(code) {
  border-radius: 0.25rem;
  background: #f3f4f6;
  padding: 0.125rem 0.25rem;
}
</style>