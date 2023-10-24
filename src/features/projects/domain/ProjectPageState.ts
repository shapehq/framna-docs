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
  if (isLoading) {
    return { state: ProjectPageState.LOADING }
  }
  if (error) {
    return { state: ProjectPageState.ERROR, error }
  }
  projects = projects || []
  // If no project is selected and the user only has a single project then we select that.
  if (!selectedProjectId && projects.length == 1) {
    selectedProjectId = projects[0].id
  }
  if (!selectedProjectId) {
    return { state: ProjectPageState.NO_PROJECT_SELECTED }
  }
  const project = projects.find(e => e.id == selectedProjectId)
  if (!project) {
    return { state: ProjectPageState.PROJECT_NOT_FOUND }
  }
  // Find selected version or default to first version if none is selected.
  let version: Version
  if (selectedVersionId) {
    const selectedVersion = project.versions.find(e => e.id == selectedVersionId)
    if (selectedVersion) {
      version = selectedVersion
    } else {
      return { state: ProjectPageState.VERSION_NOT_FOUND }
    }
  } else if (project.versions.length > 0) {
    version = project.versions[0]
  } else {
    return { state: ProjectPageState.VERSION_NOT_FOUND }
  }
  // Find selected specification or default to first specification if none is selected.
  let specification: OpenApiSpecification
  if (selectedSpecificationId) {
    const selectedSpecification = version.specifications.find(e => e.id == selectedSpecificationId)
    if (selectedSpecification) {
      specification = selectedSpecification
    } else {
      return { state: ProjectPageState.SPECIFICATION_NOT_FOUND }
    }
  } else if (version.specifications.length > 0) {
    specification = version.specifications[0]
  } else {
    return { state: ProjectPageState.SPECIFICATION_NOT_FOUND }
  }
  return {
    state: ProjectPageState.HAS_SELECTION,
    selection: { project, version, specification }
  }
}

export default ProjectPageState
