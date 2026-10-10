
import { ref } from 'vue'

/**
 * Composable untuk mengelola nilai input form.
 *
 * @param {string|number} initialValue Nilai awal input.
 * @returns {object} Nilai input dan fungsi pengelolanya.
 */
export function useInput(initialValue = '') {
  const value = ref(initialValue)

  /**
   * Memperbarui nilai input.
   */
  function onInput(event) {
    value.value = event?.target
      ? event.target.value
      : event
  }

  /**
   * Mengatur ulang nilai input ke nilai awal.
   */
  function reset() {
    value.value = initialValue
  }

  return {
    value,
    onInput,
    reset,
  }
}

export default useInput