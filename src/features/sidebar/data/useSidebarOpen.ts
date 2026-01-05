import { useLayoutEffect, useState } from "react"
import { useSessionStorage } from "usehooks-ts"

export default function useSidebarOpen() {
  const [isSidebarOpen, setSidebarOpen, removeSidebarOpen] = useSessionStorage(
    "isSidebarOpen",
    true,
    { initializeWithValue: false }
  )
  const [shouldAnimate, setShouldAnimate] = useSessionStorage(
    "isSidebarOpenAnimateNext",
    false,
    { initializeWithValue: false }
  )
  const [isInitialized, setIsInitialized] = useState(false)

  useLayoutEffect(() => {
    if (typeof window === "undefined") {
      setShouldAnimate(false)
      setIsInitialized(true)
      return
    }

    const rawValue = window.sessionStorage.getItem("isSidebarOpen")
    if (rawValue !== null) {
      try {
        const parsedValue = JSON.parse(rawValue)
        if (typeof parsedValue === "boolean") {
          setSidebarOpen(parsedValue)
        }
      } catch (error) {
        // Ignore invalid storage values and keep defaults.
      }
    }

    setShouldAnimate(false)
    setIsInitialized(true)
  }, [setSidebarOpen, setShouldAnimate])

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

  return [
    isSidebarOpen,
    setSidebarOpen,
    removeSidebarOpen,
    isInitialized,
    shouldAnimate,
    setSidebarOpenWithTransition,
    setShouldAnimate
  ] as const
}
