import { List, Box, Typography } from "@mui/material"
import ProjectListItem from "./ProjectListItem"
import ProjectListItemPlaceholder from "./ProjectListItemPlaceholder"
import IProject from "../domain/IProject"

interface ProjectListProps<ProjectType extends IProject> {
  readonly isLoading: boolean
  readonly projects: ProjectType[]
  readonly selectedProjectId?: string
}

const ProjectList = <ProjectType extends IProject>(
  {
    isLoading,
    projects,
    selectedProjectId
  }: ProjectListProps<ProjectType>
) => {
  const loadingItemCount = 6
  if (isLoading || projects.length > 0) {
    return (
      <List
        disablePadding
        sx={{ width: "100%", height: "100%" }}
      >
        {isLoading && 
          [...new Array(loadingItemCount)].map((_, index) => (
            <ProjectListItemPlaceholder key={index}/>
          ))
        }
        {!isLoading && projects.map(project => (
          <ProjectListItem
            key={project.id}
            project={project}
            isSelected={project.id === selectedProjectId}
          />
        ))}
      </List>
    )
  } else {
    return (
      <Box sx={{
        display: "flex",
        justifyContent: "center",
        padding: "15px",
        marginTop: "15px"
      }}>
        <Typography variant="h5" align="center">
          Your list of projects is empty.
        </Typography>
      </Box>
    )
  }
}

export default ProjectList
