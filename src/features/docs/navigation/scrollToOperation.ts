import { DocumentationVisualizer } from "@/features/settings/domain"

/**
 * Generates a SwaggerUI-compatible operationId from HTTP method and path.
 * SwaggerUI generates IDs in the format: {method}_{path_normalized}
 * where path is normalized by replacing / with _ and {param} with _param_
 */
function generateSwaggerOperationId(method: string, path: string): string {
  const normalizedPath = path
    .replace(/\//g, "_")
    .replace(/\{([^}]+)\}/g, "_$1_")
  return `${method.toLowerCase()}${normalizedPath}`
}

/**
 * Finds and scrolls to a SwaggerUI operation element.
 * SwaggerUI elements have IDs in the format: operations-{tag}-{operationId}
 * Since we may not know the tag, we search for elements containing the operationId.
 */
function scrollToSwaggerOperation(operationId: string): boolean {
  const block = Array.from(document.querySelectorAll('[id^="operations-"]'))
    .find(el => el.id.endsWith(`-${operationId}`))

  if (!block) return false

  block.scrollIntoView({ behavior: "smooth", block: "start" })

  // Only expand if not already open (SwaggerUI adds is-open class to the block itself)
  if (!block.classList.contains("is-open")) {
    const button = block.querySelector(".opblock-summary-control")
    if (button instanceof HTMLElement) {
      button.click()
    }
  }

  return true
}

/**
 * Scrolls to an operation in Redocly by setting the hash on the iframe.
 */
function scrollToRedoclyOperation(operationId?: string, method?: string, path?: string): void {
  const iframe = document.querySelector("iframe")
  if (!iframe?.contentWindow) {
    return
  }

  // try direct operationId link first
  if (operationId) {
    iframe.contentWindow.location.hash = `operation/${operationId}`
    return
  }

  if (!method || !path) {
    return
  }

  // fallback to method+path matching
  const encodedPath = path.replace(/\//g, "~1")
  const links = Array.from(
    iframe.contentDocument?.querySelectorAll(`a[href*="${encodedPath}"]`) ?? []
  )

  for (const link of links) {
    const href = link.getAttribute("href")
    if (href?.includes(`/${method.toLowerCase()}`) || href?.endsWith(`/${method.toLowerCase()}`)) {
      const hash = href.startsWith("#") ? href.substring(1) : href
      iframe.contentWindow.location.hash = hash
      return
    }
  }
}

/**
 * Scrolls to an operation in the documentation viewer.
 * Each visualizer has its own mechanism for deep linking.
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
    case DocumentationVisualizer.SWAGGER: {
      // If operationId is not provided, try to generate it from method+path
      const swaggerOpId = operationId ?? (method && path ? generateSwaggerOperationId(method, path) : undefined)
      if (swaggerOpId) {
        scrollToSwaggerOperation(swaggerOpId)
      }
      break
    }

    case DocumentationVisualizer.STOPLIGHT:
      if (operationId) {
        window.location.hash = `/operations/${operationId}`
      }
      break

    case DocumentationVisualizer.REDOCLY:
      scrollToRedoclyOperation(operationId, method, path)
      break
  }
}
