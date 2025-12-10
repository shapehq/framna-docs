import { DocumentationVisualizer } from "@/features/settings/domain"

/**
 * Finds and scrolls to a SwaggerUI operation element.
 * SwaggerUI elements have IDs in the format: operations-{tag}-{operationId}
 * Since we may not know the tag, we search for elements containing the operationId.
 */
function scrollToSwaggerOperation(operationId: string): boolean {
  // SwaggerUI uses element IDs in the format: operations-{tag}-{operationId}
  const allOpBlocks = document.querySelectorAll('[id^="operations-"]')

  for (let i = 0; i < allOpBlocks.length; i++) {
    const block = allOpBlocks[i]
    if (block.id.endsWith(`-${operationId}`)) {
      block.scrollIntoView({ behavior: "smooth", block: "start" })
      // Expand the operation by clicking on its control button
      const button = block.querySelector(".opblock-summary-control")
      if (button instanceof HTMLElement) {
        button.click()
      }
      return true
    }
  }

  return false
}

/**
 * Scrolls to an operation in Redocly by setting the hash on the iframe.
 * Redocly uses hash format: #operation/{operationId}
 */
function scrollToRedoclyOperation(operationId: string): void {
  const iframe = document.querySelector("iframe")
  if (!iframe?.contentWindow) {
    return
  }
  iframe.contentWindow.location.hash = `operation/${operationId}`
}

/**
 * Scrolls to an operation in the documentation viewer.
 * Each visualizer has its own mechanism for deep linking.
 *
 * For SwaggerUI: Uses DOM-based scrolling to find operations-{tag}-{operationId} elements
 * For Stoplight: #/operations/{operationId}
 * For Redocly: #operation/{operationId} (set on iframe)
 */
export function scrollToOperation(
  visualizer: DocumentationVisualizer,
  operationId?: string,
  method?: string,
  path?: string
): void {
  if (!operationId && (!method || !path)) {
    return
  }

  switch (visualizer) {
    case DocumentationVisualizer.SWAGGER:
      // SwaggerUI: Use DOM-based scrolling since hash changes don't trigger navigation
      // after initial page load
      if (operationId) {
        scrollToSwaggerOperation(operationId)
      }
      break

    case DocumentationVisualizer.STOPLIGHT:
      // Stoplight uses hash-based navigation: #/operations/{operationId}
      if (operationId) {
        window.location.hash = `/operations/${operationId}`
      }
      break

    case DocumentationVisualizer.REDOCLY:
      // Redocly runs in an iframe and uses hash format: #tag/{tag}/operation/{operationId}
      // We need to set the hash on the iframe's content window
      if (operationId) {
        scrollToRedoclyOperation(operationId)
      }
      break
  }
}
