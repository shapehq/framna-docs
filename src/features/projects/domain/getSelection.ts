import Project from "./Project"
import Version from "./Version"
import OpenApiSpecification from "./OpenApiSpecification"

export default function getSelection({
  projects,
  path
}: {
  projects: Project[],
  path: string
}): {
  project?: Project,
  version?: Version,
  specification?: OpenApiSpecification
} {
  if (path.startsWith("/")) {
    path = path.substring(1)
  }
  const { projectId: _projectId, versionId, specificationId } = guessSelection(path)
  // If no project is selected and the user only has a single project then we select that.
  let projectId = _projectId
  if (!projectId && projects.length == 1) {
    projectId = projects[0].id
  }
  if (!projectId) {
    return {}
  }
  const project = projects.find(e => e.id == projectId)
  if (!project) {
    return {}
  }
  let version: Version | undefined
  let didMoveSpecificationIdToVersionId = false
  if (versionId) {
    version = project.versions.find(e => e.id == versionId)
    if (!version && specificationId && !isSpecificationIdFilename(specificationId)) {
      // With the introduction of remote versions that are specified in the .yml
      // configuration file, it has become impossible to tell if the last component in a URL
      // is the specification ID or if it belongs to the version ID. Previously, we required
      // specification IDs to end with either ".yml" or ".yaml" but that no longer makes
      // sense when users can define versions.
      // Instead we assume that the last component is the specification ID but if we cannot
      // find a version with what we then believe to be the version ID, then we attempt to
      // finding a version with the ID `{versionId}/{specificationId}` and if that succeeds,
      // we select the first specification in that version by flagging that the ID of the
      // specification is considered part of the version ID.
      const longId = [versionId, specificationId].join("/")
      version = project.versions.find(e => e.id == longId)
      didMoveSpecificationIdToVersionId = version != undefined
    }
  } else if (project.versions.length > 0) {
    version = project.versions[0]
  }
  if (!version) {
    return { project }
  }
  let specification: OpenApiSpecification | undefined
  if (specificationId && !didMoveSpecificationIdToVersionId) {
    specification = version.specifications.find(e => e.id == specificationId)
  } else if (version.specifications.length > 0) {
    specification = version.specifications[0]
  }
  return { project, version, specification }
}

function guessSelection(pathname: string) {
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

function isSpecificationIdFilename(specificationId: string): boolean {
  return specificationId.endsWith(".yml") || specificationId.endsWith(".yaml")
}
