import ProjectPageSelection from "./ProjectPageSelection"

export interface IProjectRouter {
  push(path: string): void
  replace(path: string): void
}

export default {
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
  },
  navigateToCurrentSelection(
    candidateSelection: {
      projectId?: string,
      versionId?: string,
      specificationId?: string
    },
    actualSelection: ProjectPageSelection,
    router: IProjectRouter
  ) {
    if (
      actualSelection.project.id != candidateSelection.projectId ||
      actualSelection.version.id != candidateSelection.versionId ||
      actualSelection.specification.id != candidateSelection.specificationId
    ) {
      router.replace(
        `/${actualSelection.project.id}/${actualSelection.version.id}/${actualSelection.specification.id}`
      )
    }
  }
}
