<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import Editor from '@toast-ui/editor'
import '@toast-ui/editor/dist/toastui-editor.css'

const props = defineProps({
  modelValue: { type: String, default: '' },
  label: { type: String, default: 'Deskripsi' },
  height: { type: String, default: '260px' },
  placeholder: { type: String, default: 'Tulis deskripsi di sini...' },
})

const emit = defineEmits(['update:modelValue'])

const container = ref(null)
let editor = null

onMounted(() => {
  editor = new Editor({
    el: container.value,
    height: props.height,
    initialValue: props.modelValue,
    initialEditType: 'markdown',
    previewStyle: 'tab',
    placeholder: props.placeholder,
    usageStatistics: false,
    events: {
      change: () => emit('update:modelValue', editor.getMarkdown()),
    },
  })
})

watch(
  () => props.modelValue,
  (value) => {
    if (editor && value !== editor.getMarkdown()) {
      editor.setMarkdown(value)
    }
  },
)

onBeforeUnmount(() => {
  editor?.destroy()
  editor = null
})
</script>

<template>
  <div class="markdown-editor">
    <span class="mb-1 block text-sm font-medium text-slate-700">
      {{ label }}
    </span>
    <div ref="container" data-testid="markdown-editor" />
  </div>
</template>
