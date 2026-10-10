import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ChangeModal from './ChangeModal.vue'

vi.mock('@toast-ui/editor', () => ({
  default: vi.fn(function () {
    return { getMarkdown: () => '', setMarkdown: vi.fn(), destroy: vi.fn() }
  }),
}))
vi.mock('@toast-ui/editor/dist/toastui-editor.css', () => ({}))

const EditorStub = {
  props: ['modelValue'],
  emits: ['update:modelValue'],
  template:
    '<textarea data-testid="desc" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
}

describe('ChangeModal', () => {
  const aucation = {
    title: 'Jam',
    description: 'Antik',
    start_bid: 500,
    closed_at: '2026-12-01 10:00:00',
  }
  const mountChange = (props = {}) =>
    mount(ChangeModal, {
      props: { show: true, aucation, ...props },
      global: { stubs: { MarkdownEditor: EditorStub } },
    })

  it('mengisi form dari data lelang dan mengirim perubahan', async () => {
    const wrapper = mountChange()
    expect(wrapper.findAll('input')[0].element.value).toBe('Jam')
    expect(wrapper.findAll('input')[2].element.value).toBe('2026-12-01T10:00')

    await wrapper.findAll('input')[0].setValue('Jam Tangan')
    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('submit')[0][0]).toEqual({
      title: 'Jam Tangan',
      description: 'Antik',
      start_bid: 500,
      closed_at: '2026-12-01 10:00:00',
    })
  })

  it('mengubah seluruh kolom sebelum mengirim', async () => {
    const wrapper = mountChange()
    const inputs = wrapper.findAll('input')
    await inputs[0].setValue('Baru')
    await wrapper.find('[data-testid="desc"]').setValue('Deskripsi baru')
    await inputs[1].setValue('900')
    await inputs[2].setValue('2027-01-01T08:30')
    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('submit')[0][0]).toEqual({
      title: 'Baru',
      description: 'Deskripsi baru',
      start_bid: 900,
      closed_at: '2027-01-01 08:30:00',
    })
  })

  it('memakai nilai kosong bila lelang null', () => {
    const wrapper = mountChange({ aucation: null })
    expect(wrapper.findAll('input')[0].element.value).toBe('')
  })

  it('validasi, tutup, dan loading', async () => {
    const wrapper = mountChange()
    await wrapper.findAll('input')[1].setValue('0')
    await wrapper.find('form').trigger('submit')
    expect(wrapper.find('[role="alert"]').exists()).toBe(true)

    await wrapper.find('button[aria-label="Tutup"]').trigger('click')
    await wrapper.findAll('button[type="button"]')[1].trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(2)

    await wrapper.setProps({ loading: true })
    await wrapper.find('.fixed').trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(2)
  })

  it('memuat ulang form saat dibuka kembali', async () => {
    const wrapper = mountChange({ show: false })
    expect(wrapper.find('form').exists()).toBe(false)
    await wrapper.setProps({ show: true })
    expect(wrapper.findAll('input')[0].element.value).toBe('Jam')
  })
})
