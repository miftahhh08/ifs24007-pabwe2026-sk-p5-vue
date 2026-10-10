<script setup>
defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  label: {
    type: String,
    default: 'Deskripsi',
  },
  rows: {
    type: Number,
    default: 5,
  },
  placeholder: {
    type: String,
    default: 'Tulis deskripsi di sini...',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <div class="markdown-editor">
    <label class="editor-label">{{ label }}</label>

    <textarea
      class="editor-textarea"
      :value="modelValue"
      :rows="rows"
      :placeholder="placeholder"
      :disabled="disabled"
      @input="emit('update:modelValue', $event.target.value)"
    />

    <p class="editor-hint">
      Kamu dapat menggunakan Markdown untuk memformat teks.
    </p>
  </div>
</template>

<style scoped>
.markdown-editor {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.editor-label {
  font-weight: 600;
  color: #374151;
}

.editor-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font: inherit;
  resize: vertical;
  box-sizing: border-box;
}

.editor-textarea:focus {
  outline: 2px solid #a78bfa;
  border-color: #8b5cf6;
}

.editor-textarea:disabled {
  background: #f3f4f6;
  cursor: not-allowed;
}

.editor-hint {
  margin: 0;
  color: #6b7280;
  font-size: 12px;
}
</style>
