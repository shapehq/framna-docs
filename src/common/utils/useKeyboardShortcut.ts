"use client"

import { useEffect } from "react"

const useKeyboardShortcut = (
  handleKeyDown: (event: KeyboardEvent) => void,
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  dependencies: any[]
) => {
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [handleKeyDown, ...dependencies])
}

export default useKeyboardShortcut