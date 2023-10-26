import Project from "./Project"
import Version from "./Version"
import OpenApiSpecification from "./OpenApiSpecification"
import ProjectPageSelection from "./ProjectPageSelection"

export enum ProjectPageState {
  LOADING,
  ERROR,
  HAS_SELECTION,
  NO_PROJECT_SELECTED,
  PROJECT_NOT_FOUND,
  VERSION_NOT_FOUND,
  SPECIFICATION_NOT_FOUND
}

export type ProjectPageStateContainer = {
  readonly state: ProjectPageState
  readonly selection?: ProjectPageSelection
  readonly error?: Error
}

type GetProjectPageStateProps = {
  isLoading?: boolean
  error?: Error
  projects?: Project[]
  selectedProjectId?: string
  selectedVersionId?: string
  selectedSpecificationId?: string
}

export function getProjectPageState({
  isLoading,
  error,
  projects,
  selectedProjectId,
  selectedVersionId,
  selectedSpecificationId
}: GetProjectPageStateProps): ProjectPageStateContainer {
  // If no project is selected and the user only has a single project then we select that.
  projects = projects || []
  if (!selectedProjectId && projects.length == 1) {
    selectedProjectId = projects[0].id
  }
  const { project, version, specification } = getSelection(
    projects,
    selectedProjectId,
    selectedVersionId,
    selectedSpecificationId
  )
  if (project && version && specification) {
    return {
      state: ProjectPageState.HAS_SELECTION,
      selection: { project, version, specification }
    }
  } else if (isLoading) {
    return { state: ProjectPageState.LOADING }
  } else if (error) {
    return { state: ProjectPageState.ERROR, error }
  } else if (!selectedProjectId) {
    return { state: ProjectPageState.NO_PROJECT_SELECTED }
  } else if (!project) {
    return { state: ProjectPageState.PROJECT_NOT_FOUND }
  } else if (!version) {
    return { state: ProjectPageState.VERSION_NOT_FOUND }
  } else {
    return { state: ProjectPageState.SPECIFICATION_NOT_FOUND }
  }
}

function getSelection(
  projects: Project[],
  projectId?: string,
  versionId?: string,
  specificationId?: string
): {
  project?: Project,
  version?: Version,
  specification?: OpenApiSpecification
} {
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

export default ProjectPageState
