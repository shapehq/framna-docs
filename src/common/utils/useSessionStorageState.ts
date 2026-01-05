import { useCallback, useSyncExternalStore } from "react"

type SetStateAction<T> = T | ((prev: T) => T)

const readValue = <T,>(key: string, defaultValue: T): T => {
  if (typeof window === "undefined") {
    return defaultValue
  }

  const raw = window.sessionStorage.getItem(key)
  if (raw === null) {
    return defaultValue
  }

  try {
    return JSON.parse(raw) as T
  } catch {
    return defaultValue
  }
}

const subscribeToStorage = (onStoreChange: () => void) => {
  if (typeof window === "undefined") {
    return () => {}
  }

  const handler = () => onStoreChange()
  window.addEventListener("storage", handler)
  window.addEventListener("session-storage", handler)

  return () => {
    window.removeEventListener("storage", handler)
    window.removeEventListener("session-storage", handler)
  }
}

export default function useSessionStorageState<T>(key: string, defaultValue: T) {
  const getSnapshot = useCallback(() => readValue(key, defaultValue), [key, defaultValue])
  const getServerSnapshot = useCallback(() => defaultValue, [defaultValue])
  const value = useSyncExternalStore(subscribeToStorage, getSnapshot, getServerSnapshot)

  const setValue = useCallback(
    (nextValue: SetStateAction<T>) => {
      if (typeof window === "undefined") {
        return
      }

      const currentValue = readValue(key, defaultValue)
      const valueToStore = typeof nextValue === "function"
        ? (nextValue as (prev: T) => T)(currentValue)
        : nextValue

      window.sessionStorage.setItem(key, JSON.stringify(valueToStore))
      window.dispatchEvent(new Event("session-storage"))
    },
    [key, defaultValue]
  )

  return [value, setValue] as const
}
