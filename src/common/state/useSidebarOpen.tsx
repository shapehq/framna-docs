import { useSessionStorage } from "usehooks-ts"

export default function sidebarOpen() {
 return useSessionStorage("isSidebarOpen", true)
}