
import { describe, it, expect } from 'vitest'
import { useInput } from './useInput.js'

describe('useInput', () => {
  it('menggunakan nilai awal default berupa string kosong', () => {
    const input = useInput()

    expect(input.value.value).toBe('')
  })

  it('menggunakan nilai awal yang diberikan', () => {
    const input = useInput('Jannah')

    expect(input.value.value).toBe('Jannah')
  })

  it('menerima nilai dari event input', () => {
    const input = useInput()

    input.onInput({
      target: {
        value: 'Belajar Vue',
      },
    })

    expect(input.value.value).toBe('Belajar Vue')
  })

  it('menerima nilai langsung tanpa event', () => {
    const input = useInput()

    input.onInput('Nilai langsung')

    expect(input.value.value).toBe('Nilai langsung')
  })

  it('menerima nilai undefined dari input langsung', () => {
    const input = useInput()

    input.onInput(undefined)

    expect(input.value.value).toBeUndefined()
  })

  it('mengatur ulang nilai ke nilai awal', () => {
    const input = useInput('Awal')

    input.onInput('Berubah')
    input.reset()

    expect(input.value.value).toBe('Awal')
  })

  it('mengatur ulang nilai awal angka', () => {
    const input = useInput(10)

    input.onInput(20)
    input.reset()

    expect(input.value.value).toBe(10)
  })
})