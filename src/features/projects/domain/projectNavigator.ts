import Project from "./Project"

export interface IProjectRouter {
  readonly pathname: string
  push(path: string): void
  replace(path: string): void
}

const projectNavigator = {
  navigateToVersion(
    router: IProjectRouter,
    project: Project,
    versionId: string,
    preferredSpecificationName: string
  ) {
    // Let's see if we can find a specification with the same name.
    const newVersion = project.versions.find(e => {
      return e.id == versionId
    })
    if (!newVersion) {
      return
    }
    const candidateSpecification = newVersion.specifications.find(e => {
      return e.name == preferredSpecificationName
    })
    if (candidateSpecification) {
      router.push(`/${project.id}/${newVersion.id}/${candidateSpecification.id}`)
    } else {
      const firstSpecification = newVersion.specifications[0]
      router.push(`/${project.id}/${newVersion.id}/${firstSpecification.id}`)
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
    selection: {
      projectId?: string,
      versionId?: string,
      specificationId?: string
    }
  ) {
    if (!selection.projectId || !selection.versionId || !selection.specificationId) {
      return
    }
    const path = `/${selection.projectId}/${selection.versionId}/${selection.specificationId}`
    if (path !== router.pathname) {
      router.replace(path)
    }
  }
}

export default projectNavigator