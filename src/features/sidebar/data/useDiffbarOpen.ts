import { useEffect, useSyncExternalStore } from "react"
import useSessionStorageState from "@/common/utils/useSessionStorageState"

type Options = { clearAnimationAfterMs?: number }

export default function useDiffbarOpen(options: Options = {}) {
  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )
  const [isDiffbarOpen, setDiffbarOpen] = useSessionStorageState("isDiffbarOpen", false)
  const [shouldAnimate, setShouldAnimate] = useSessionStorageState("isDiffbarOpenAnimateNext", false)
  const isInitialized = isHydrated

  useEffect(() => {
    if (!shouldAnimate || !options.clearAnimationAfterMs) {
      return
    }
    const timeout = window.setTimeout(() => {
      setShouldAnimate(false)
    }, options.clearAnimationAfterMs)
    return () => window.clearTimeout(timeout)
  }, [options.clearAnimationAfterMs, setShouldAnimate, shouldAnimate])

  const setDiffbarOpenWithTransition = (value: boolean | ((prev: boolean) => boolean)) => {
    setShouldAnimate(true)
    if (typeof window === "undefined") {
      setDiffbarOpen(value)
      return
    }
    window.setTimeout(() => {
      setDiffbarOpen(value)
    }, 0)
  }

  return {
    isOpen: isDiffbarOpen,
    isInitialized,
    shouldAnimate,
    setOpen: setDiffbarOpen,
    setOpenWithTransition: setDiffbarOpenWithTransition
  } as const
}
