function getPathname(url?: string) {
  if (typeof window !== "undefined") {
    url = window.location.pathname
  }
  if (!url) {
    return undefined
  }
  if (!url.startsWith("/")) {
    return url
  }
  return url.substring(1) 
}

function getProjectSelection(tmpPathname?: string) {
  const pathname = getPathname(tmpPathname)
  if (!pathname) {
    return undefined
  }
  const comps = pathname.split("/")
  if (comps.length == 0) {
    return {}
  } else if (comps.length == 1) {
    return { projectId: comps[0] }
  } else if (comps.length == 2) {
    return {
      projectId: comps[0],
      versionId: comps[1]
    }
  } else {
    const projectId = comps[0]
    const versionId = comps.slice(1, -1).join("/")
    const specificationId = comps[comps.length - 1]
    return { projectId, versionId, specificationId }
  }
}

export function getProjectId(tmpPathname?: string) {
  return getProjectSelection(tmpPathname)?.projectId
}

export function getVersionId(tmpPathname?: string) {
  return getProjectSelection(tmpPathname)?.versionId
}

export function getSpecificationId(tmpPathname?: string) {
  return getProjectSelection(tmpPathname)?.specificationId
}
