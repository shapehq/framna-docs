import Project from "./Project"

interface IPathnameReader {
  readonly pathname: string
}

export interface IRouter {
  push(path: string): void
  replace(path: string): void
}

type ProjectNavigatorConfig = {
  readonly pathnameReader: IPathnameReader
  readonly router: IRouter
}

export default class ProjectNavigator {
  private readonly pathnameReader: IPathnameReader
  private readonly router: IRouter
  
  constructor(config: ProjectNavigatorConfig) {
    this.pathnameReader = config.pathnameReader
    this.router = config.router
  }
  
  navigateToVersion(
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
      this.router.push(`/${project.id}/${newVersion.id}/${candidateSpecification.id}`)
    } else {
      const firstSpecification = newVersion.specifications[0]
      this.router.push(`/${project.id}/${newVersion.id}/${firstSpecification.id}`)
    }
  }
  
  navigate(
    projectId: string,
    versionId: string,
    specificationId: string
  ) {
    this.router.push(`/${projectId}/${versionId}/${specificationId}`)
  }
  
  navigateIfNeeded(
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
    if (path !== this.pathnameReader.pathname) {
      this.router.replace(path)
    }
  }
}
