import { useRouter } from "next/navigation"
import { Stack, IconButton } from "@mui/material"
import ProjectSelection, { ProjectSelectionState } from "../domain/ProjectSelection"
import VersionSelector from "./docs/VersionSelector"
import SpecificationSelector from "./docs/SpecificationSelector"
import EditIcon from "@mui/icons-material/Edit"

export default function ProjectToolbarTrailingItem(
  { projectSelection }: { projectSelection: ProjectSelection }
) {
  const router = useRouter()
  const currentSelection = projectSelection.selection!
  const onSelectVersion = (versionId: string) => {
    // Let's see if we can find a specification with the same name.
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
    router.push(`/${currentSelection.project.id}/${currentSelection.version.id}/${specificationId}`)
  }
  switch (projectSelection.state) {
  case ProjectSelectionState.HAS_SELECTION:
    return (
      <Stack direction="row" alignItems="center">
        <VersionSelector
          versions={currentSelection.project.versions}
          selection={currentSelection.version.id}
          onSelect={onSelectVersion}
        />
        <SpecificationSelector
          specifications={currentSelection.version.specifications}
          selection={currentSelection.specification.id}
          onSelect={onSelectSpecification}
        />
        <IconButton href={currentSelection.specification.editURL} target="_blank" >
          <EditIcon />
        </IconButton>
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
