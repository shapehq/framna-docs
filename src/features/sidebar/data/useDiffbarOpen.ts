import { useSessionStorage } from "usehooks-ts"

export default function useDiffbarOpen() {
  return useSessionStorage("isDiffbarOpen", false, { initializeWithValue: false })
}