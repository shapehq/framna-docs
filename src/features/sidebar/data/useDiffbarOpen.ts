import { useLayoutEffect, useState } from "react"
import { useSessionStorage } from "usehooks-ts"

export default function useDiffbarOpen() {
  const [isDiffbarOpen, setDiffbarOpen, removeDiffbarOpen] = useSessionStorage(
    "isDiffbarOpen",
    false,
    { initializeWithValue: false }
  )
  const [shouldAnimate, setShouldAnimate] = useSessionStorage(
    "isDiffbarOpenAnimateNext",
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

    const rawValue = window.sessionStorage.getItem("isDiffbarOpen")
    if (rawValue !== null) {
      try {
        const parsedValue = JSON.parse(rawValue)
        if (typeof parsedValue === "boolean") {
          setDiffbarOpen(parsedValue)
        }
      } catch (error) {
        // Ignore invalid storage values and keep defaults.
      }
    }

    setShouldAnimate(false)
    setIsInitialized(true)
  }, [setDiffbarOpen, setShouldAnimate])

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

  return [
    isDiffbarOpen,
    setDiffbarOpen,
    removeDiffbarOpen,
    isInitialized,
    shouldAnimate,
    setDiffbarOpenWithTransition,
    setShouldAnimate
  ] as const
}
