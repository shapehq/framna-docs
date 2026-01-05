import { useLayoutEffect, useEffect, useState, useRef } from "react"
import { useSessionStorage } from "usehooks-ts"

type Options = { clearAnimationAfterMs?: number }

export default function usePanelOpen(
  key: string,
  defaultValue: boolean,
  options: Options = {}
) {
  const [isOpen, setOpen] = useSessionStorage(key, defaultValue, {
    initializeWithValue: false
  })
  const [shouldAnimate, setShouldAnimate] = useSessionStorage(
    `${key}AnimateNext`,
    false,
    { initializeWithValue: false }
  )
  const [isInitialized, setIsInitialized] = useState(false)
  const rafRef = useRef<number | null>(null)

  useLayoutEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const rawValue = window.sessionStorage.getItem(key)
    if (rawValue !== null) {
      try {
        const parsedValue = JSON.parse(rawValue)
        if (typeof parsedValue === "boolean") {
          setOpen(parsedValue)
        }
      } catch {
        // Ignore invalid storage values and keep defaults.
      }
    }

    const raf = window.requestAnimationFrame(() => {
      setShouldAnimate(false)
      setIsInitialized(true)
    })

    return () => window.cancelAnimationFrame(raf)
  }, [key, setOpen, setShouldAnimate])

  useEffect(() => {
    if (!shouldAnimate || !options.clearAnimationAfterMs) {
      return
    }
    const timeout = window.setTimeout(() => {
      setShouldAnimate(false)
    }, options.clearAnimationAfterMs)
    return () => window.clearTimeout(timeout)
  }, [options.clearAnimationAfterMs, setShouldAnimate, shouldAnimate])

  const setOpenWithTransition = (value: boolean | ((prev: boolean) => boolean)) => {
    setShouldAnimate(true)
    if (typeof window === "undefined") {
      setOpen(value)
      return
    }
    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current)
    }
    rafRef.current = window.requestAnimationFrame(() => {
      setOpen(value)
      rafRef.current = null
    })
  }

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }
  }, [])

  return {
    isOpen,
    isInitialized,
    shouldAnimate,
    setOpen,
    setOpenWithTransition
  } as const
}
