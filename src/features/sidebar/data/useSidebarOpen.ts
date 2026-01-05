import usePanelOpen from "./usePanelOpen"

type Options = { clearAnimationAfterMs?: number }

export default function useSidebarOpen(options: Options = {}) {
  return usePanelOpen("isSidebarOpen", true, options)
}
