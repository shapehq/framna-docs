import ProjectPageSelection from "./ProjectPageSelection"

export interface IProjectRouter {
  push(path: string): void
  replace(path: string): void
}

const projectNavigator = {
  navigateToVersion(
    router: IProjectRouter,
    selection: ProjectPageSelection,
    versionId: string,
  ) {
    // Let's see if we can find a specification with the same name.
    const newVersion = selection.project.versions.find(e => {
      return e.id == versionId
    })
    if (!newVersion) {
      return
    }
    const candidateSpecification = newVersion.specifications.find(e => {
      return e.name == selection.specification.name
    })
    if (candidateSpecification) {
      router.push(`/${selection.project.id}/${newVersion.id}/${candidateSpecification.id}`)
    } else {
      const firstSpecification = newVersion.specifications[0]
      router.push(`/${selection.project.id}/${newVersion.id}/${firstSpecification.id}`)
    }
  },
  navigate(
    router: IProjectRouter,
    projectId: string,
    versionId: string,
    specificationId: string
  ) {
    router.push(`/${projectId}/${versionId}/${specificationId}`)
  },
  navigateIfNeeded(
    router: IProjectRouter,
    urlComponents: {
      projectId?: string,
      versionId?: string,
      specificationId?: string
    },
    selection: ProjectPageSelection
  ) {
    if (
      urlComponents.projectId != selection.project.id ||
      urlComponents.versionId != selection.version.id ||
      urlComponents.specificationId != selection.specification.id
    ) {
      const path = `/${selection.project.id}/${selection.version.id}/${selection.specification.id}`
      router.replace(path)
    }
  }
}

export default projectNavigator