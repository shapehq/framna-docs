import usePanelOpen from "./usePanelOpen"

type Options = { clearAnimationAfterMs?: number }

export default function useDiffbarOpen(options: Options = {}) {
  return usePanelOpen("isDiffbarOpen", false, options)
}
