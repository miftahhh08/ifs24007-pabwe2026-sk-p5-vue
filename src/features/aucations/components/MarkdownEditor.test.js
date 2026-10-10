import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MarkdownEditor from './MarkdownEditor.vue'

describe('MarkdownEditor.vue', () => {
  it('menampilkan label, nilai awal, dan placeholder', () => {
    const wrapper = mount(MarkdownEditor, {
      props: {
        label: 'Deskripsi',
        modelValue: 'Teks awal',
        placeholder: 'Masukkan deskripsi',
      },
    })

    expect(wrapper.text()).toContain('Deskripsi')
    expect(wrapper.find('textarea').element.value).toBe('Teks awal')
    expect(wrapper.find('textarea').attributes('placeholder')).toBe('Masukkan deskripsi')
  })

  it('mengirim update:modelValue saat teks berubah', async () => {
    const wrapper = mount(MarkdownEditor, {
      props: { modelValue: '' },
    })

    await wrapper.find('textarea').setValue('Deskripsi baru')

    expect(wrapper.emitted('update:modelValue')).toEqual([['Deskripsi baru']])
  })

  it('menggunakan nilai default dan rows yang diberikan', () => {
    const wrapper = mount(MarkdownEditor, {
      props: { rows: 6 },
    })

    expect(wrapper.find('textarea').attributes('rows')).toBe('6')
    expect(wrapper.find('textarea').element.value).toBe('')
  })

  it('menonaktifkan textarea ketika disabled true', () => {
    const wrapper = mount(MarkdownEditor, {
      props: { disabled: true },
    })

    expect(wrapper.find('textarea').element.disabled).toBe(true)
  })
})
