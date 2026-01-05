import { useEffect, useSyncExternalStore } from "react"
import useSessionStorageState from "@/common/utils/useSessionStorageState"

type Options = { clearAnimationAfterMs?: number }

export default function useSidebarOpen(options: Options = {}) {
  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )
  const [isSidebarOpen, setSidebarOpen] = useSessionStorageState("isSidebarOpen", true)
  const [shouldAnimate, setShouldAnimate] = useSessionStorageState("isSidebarOpenAnimateNext", false)
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

  const setSidebarOpenWithTransition = (value: boolean | ((prev: boolean) => boolean)) => {
    setShouldAnimate(true)
    if (typeof window === "undefined") {
      setSidebarOpen(value)
      return
    }
    window.setTimeout(() => {
      setSidebarOpen(value)
    }, 0)
  }

  return {
    isOpen: isSidebarOpen,
    isInitialized,
    shouldAnimate,
    setOpen: setSidebarOpen,
    setOpenWithTransition: setSidebarOpenWithTransition
  } as const
}
