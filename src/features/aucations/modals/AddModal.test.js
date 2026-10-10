import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import AddModal from './AddModal.vue'

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

const mountModal = (props = {}) =>
  mount(AddModal, {
    props: { show: true, ...props },
    global: { stubs: { MarkdownEditor: EditorStub } },
  })

async function fill(wrapper, { title = 'Laptop', desc = 'Bagus', bid = '1000', closed = '2026-12-01T10:00' } = {}) {
  const inputs = wrapper.findAll('input')
  await inputs[0].setValue(title)
  await wrapper.find('[data-testid="desc"]').setValue(desc)
  await inputs[1].setValue(bid)
  await inputs[2].setValue(closed)
}

describe('AddModal', () => {
  it('tidak merender apa pun saat show=false', () => {
    expect(mountModal({ show: false }).find('form').exists()).toBe(false)
  })

  it('mengirim data dengan closed_at format API', async () => {
    const wrapper = mountModal()
    await fill(wrapper)
    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('submit')[0][0]).toEqual({
      title: 'Laptop',
      description: 'Bagus',
      start_bid: 1000,
      closed_at: '2026-12-01 10:00:00',
    })
  })

  it('menampilkan error bila form belum lengkap', async () => {
    const wrapper = mountModal()
    await wrapper.find('form').trigger('submit')
    expect(wrapper.find('[role="alert"]').exists()).toBe(true)
    expect(wrapper.emitted('submit')).toBeUndefined()
  })

  it('menutup modal lewat tombol, backdrop, dan Batal kecuali saat loading', async () => {
    const wrapper = mountModal()
    await wrapper.find('button[aria-label="Tutup"]').trigger('click')
    await wrapper.find('.fixed').trigger('click')
    await wrapper.findAll('button[type="button"]')[1].trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(3)

    await wrapper.setProps({ loading: true })
    await wrapper.find('button[aria-label="Tutup"]').trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(3)
    expect(wrapper.find('button[type="submit"]').text()).toBe('Menyimpan...')
  })

  it('mengosongkan form dan error saat modal ditutup', async () => {
    const wrapper = mountModal()
    await fill(wrapper)
    await wrapper.find('form').trigger('submit')
    await wrapper.setProps({ show: false })
    await wrapper.setProps({ show: true })
    expect(wrapper.findAll('input')[0].element.value).toBe('')
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
  })
})
