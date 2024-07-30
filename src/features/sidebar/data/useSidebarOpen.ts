import { useSessionStorage } from "usehooks-ts"

export default function useSidebarOpen() {
  return useSessionStorage("isSidebarOpen", true)
}