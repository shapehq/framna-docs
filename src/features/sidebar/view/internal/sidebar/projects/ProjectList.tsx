import { useContext } from "react"
import { Box, Typography } from "@mui/material"
import {  ProjectsContainerContext } from "@/common"
import SpacedList from "@/common/ui/SpacedList"
import { useProjectSelection } from "@/features/projects/data"
import ProjectListItem from "./ProjectListItem"
import ProjectListItemPlaceholder from "./ProjectListItemPlaceholder"

const ProjectList = () => {
  const { projects, isLoading } = useContext(ProjectsContainerContext)
  const projectSelection = useProjectSelection()
  const itemSpacing = 1
  if (isLoading) {
    return (
      <SpacedList itemSpacing={itemSpacing}>
        {
          [...new Array(6)].map((_, idx) => (
            <ProjectListItemPlaceholder key={idx} />
          ))
        }
      </SpacedList>
    )
  } else if (projects.length > 0) {
    return (
      <SpacedList itemSpacing={itemSpacing}>
        {projects.map(project => (
          <ProjectListItem
            project={project}
            isSelected={project.id === projectSelection.project?.id}
            onSelectProject={projectSelection.selectProject}
          />
        ))}
      </SpacedList>
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
