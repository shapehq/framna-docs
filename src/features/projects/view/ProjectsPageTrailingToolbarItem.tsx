import { Stack, IconButton, Typography, Link } from "@mui/material"
import { ProjectPageStateContainer, ProjectPageState } from "../domain/ProjectPageState"
import VersionSelector from "./docs/VersionSelector"
import SpecificationSelector from "./docs/SpecificationSelector"
import EditIcon from "@mui/icons-material/Edit"

const ProjectsPageTrailingToolbarItem = (
  {
    stateContainer,
    onSelectVersion,
    onSelectSpecification
  }: {
    stateContainer: ProjectPageStateContainer,
    onSelectVersion: (versionId: string) => void,
    onSelectSpecification: (specificationId: string) => void
  }
) => {
  switch (stateContainer.state) {
  case ProjectPageState.HAS_SELECTION:
    return (
      <Stack direction="row" alignItems="center" spacing={1}>
        {stateContainer.selection!.version.url &&
          <Link
            variant="body1"
            color="inherit"
            underline="hover"
            href={stateContainer.selection!.version.url}
            target="_blank"
          >
            {stateContainer.selection!.project.name}
          </Link>
        }
        {!stateContainer.selection!.version.url &&
          <Typography variant="body1">
            {stateContainer.selection!.project.name}
          </Typography>
        }
        <Typography variant="h6">/</Typography>
        <VersionSelector
          versions={stateContainer.selection!.project.versions}
          selection={stateContainer.selection!.version.id}
          onSelect={onSelectVersion}
        />
        <Typography variant="h6">/</Typography>
        <SpecificationSelector
          specifications={stateContainer.selection!.version.specifications}
          selection={stateContainer.selection!.specification.id}
          onSelect={onSelectSpecification}
        />
        {stateContainer.selection!.specification.editURL &&
          <IconButton href={stateContainer.selection!.specification.editURL} target="_blank" >
            <EditIcon />
          </IconButton>
        }
      </Stack>
    )
  case ProjectPageState.LOADING:
  case ProjectPageState.NO_PROJECT_SELECTED:
  case ProjectPageState.PROJECT_NOT_FOUND:
  case ProjectPageState.VERSION_NOT_FOUND:
  case ProjectPageState.SPECIFICATION_NOT_FOUND:
    return <></>
  }
}

export default ProjectsPageTrailingToolbarItem