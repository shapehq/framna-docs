"use client"

import { useEffect } from "react"

const useKeyboardShortcut = (
  handleKeyDown: (event: KeyboardEvent) => void,
  dependencies: any[]
) => {
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, dependencies)
}

export default useKeyboardShortcut