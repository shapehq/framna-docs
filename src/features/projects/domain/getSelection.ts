import Project from "./Project"
import Version from "./Version"
import OpenApiSpecification from "./OpenApiSpecification"

export default function getSelection({
  projects,
  projectId,
  versionId,
  specificationId,
}: {
  projects: Project[],
  projectId?: string,
  versionId?: string,
  specificationId?: string
}): {
  project?: Project,
  version?: Version,
  specification?: OpenApiSpecification
} {
  // If no project is selected and the user only has a single project then we select that.
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
  if (versionId) {
    version = project.versions.find(e => e.id == versionId)
  } else if (project.versions.length > 0) {
    version = project.versions[0]
  }
  if (!version) {
    return { project }
  }
  let specification: OpenApiSpecification | undefined
  if (specificationId) {
    specification = version.specifications.find(e => e.id == specificationId)
  } else if (version.specifications.length > 0) {
    specification = version.specifications[0]
  }
  return { project, version, specification }
}