import { useContext } from "react"
import { List, Box, Typography } from "@mui/material"
import { ProjectsContainerContext } from "@/common"
import { useProjectSelection } from "@/features/projects/data"
import ProjectListItem from "./ProjectListItem"
import ProjectListItemPlaceholder from "./ProjectListItemPlaceholder"

const ProjectList = () => {
  const { projects, isLoading } = useContext(ProjectsContainerContext)
  const projectSelection = useProjectSelection()
  const loadingItemCount = 6
  const itemSpacing = 1
  if (isLoading || projects.length > 0) {
    return (
      <List disablePadding sx={{ margin: 0 }}>
        {isLoading && 
          [...new Array(loadingItemCount)].map((_, idx) => (
            <Box key={idx} sx={{
              marginBottom: idx < loadingItemCount - 1 ? itemSpacing : 0
            }}>
              <ProjectListItemPlaceholder/>
            </Box>
          ))
        }
        {!isLoading && projects.map((project, idx) => (
          <Box key={project.id} sx={{
            marginBottom: idx < projects.length - 1 ? itemSpacing : 0
          }}>
            <ProjectListItem
              project={project}
              isSelected={project.id === projectSelection.project?.id}
              onSelectProject={projectSelection.selectProject}
            />
          </Box>
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
