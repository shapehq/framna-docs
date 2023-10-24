import ProjectPageSelection from "./ProjectPageSelection"

export interface IProjectRouter {
  push(path: string): void
  replace(path: string): void
}

const projectNavigator = {
  navigateToVersion(
    selection: ProjectPageSelection,
    versionId: string,
    router: IProjectRouter
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
  navigateToSpecification(
    selection: ProjectPageSelection,
    specificationId: string,
    router: IProjectRouter
  ) {
    router.push(`/${selection.project.id}/${selection.version.id}/${specificationId}`)
  } 
}

export default projectNavigator