import { ref, onMounted, onUnmounted } from 'vue'

export function useResize(callback: () => void, debounce = 200) {
  let timer: ReturnType<typeof setTimeout> | null = null
  const isMobile = ref(false)

  function check() {
    isMobile.value = window.innerWidth < 1024
    callback()
  }

  onMounted(() => {
    check()
    window.addEventListener('resize', () => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(check, debounce)
    })
  })

  onUnmounted(() => {
    if (timer) clearTimeout(timer)
    window.removeEventListener('resize', check)
  })

  return { isMobile }
}
