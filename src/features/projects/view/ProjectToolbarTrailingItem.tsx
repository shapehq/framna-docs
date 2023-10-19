"use client"

import { useRouter } from "next/navigation"
import { Stack } from "@mui/material"
import ProjectSelection, { ProjectSelectionState } from "../domain/ProjectSelection"
import VersionSelector from "./docs/VersionSelector"
import SpecificationSelector from "./docs/SpecificationSelector"

export default function ProjectToolbarTrailingItem(
  { projectSelection }: { projectSelection: ProjectSelection }
) {
  const router = useRouter()
  const onSelectVersion = (versionId: string) => {
    // Let's see if we can find a specification with the same name.
    const currentSelection = projectSelection.selection!
    const newVersion = currentSelection.project.versions.find(e => {
      return e.id == versionId
    })
    if (!newVersion) {
      return
    }
    const candidateSpecification = newVersion.specifications.find(e => {
      return e.name == currentSelection.specification.name
    })
    if (candidateSpecification) {
      router.push(`/${currentSelection.project.id}/${newVersion.id}/${candidateSpecification.id}`)
    } else {
      const firstSpecification = newVersion.specifications[0]
      router.push(`/${currentSelection.project.id}/${newVersion.id}/${firstSpecification.id}`)
    }
  }
  const onSelectSpecification = (specificationId: string) => {
    const currentSelection = projectSelection.selection!
    router.push(`/${currentSelection.project.id}/${currentSelection.version.id}/${specificationId}`)
  }
  switch (projectSelection.state) {
  case ProjectSelectionState.HAS_SELECTION:
    return (
      <Stack direction="row">
        <VersionSelector
          versions={projectSelection.selection!.project.versions}
          selection={projectSelection.selection!.version.id}
          onSelect={onSelectVersion}
        />
        <SpecificationSelector
          specifications={projectSelection.selection!.version.specifications}
          selection={projectSelection.selection!.specification.id}
          onSelect={onSelectSpecification}
        />
      </Stack>
    )
  case ProjectSelectionState.LOADING:
  case ProjectSelectionState.NO_PROJECT_SELECTED:
  case ProjectSelectionState.PROJECT_NOT_FOUND:
  case ProjectSelectionState.VERSION_NOT_FOUND:
  case ProjectSelectionState.SPECIFICATION_NOT_FOUND:
    return <></>
  }
}
