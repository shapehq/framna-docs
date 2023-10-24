import { ListItem, ListItemButton, ListItemText, Typography } from "@mui/material"
import Project from "../domain/Project"
import ProjectAvatar from "./ProjectAvatar"

const ProjectListItem = (
  {
    project,
    isSelected,
    onSelectProject
  }: {
    project: Project
    isSelected: boolean
    onSelectProject: (project: Project) => void
  }
) => {
  return (
    <ListItem disablePadding>
      <ListItemButton
        onClick={() => onSelectProject(project)}
        selected={isSelected}
        sx={{
          paddingLeft: "15px",
          paddingRight: "15px",
          paddingTop: "15px",
          paddingBottom: "15px"
        }}
        disableGutters
      >
        <ProjectAvatar
          project={project}
          sx={{
            width: 40,
            height: 40,
            marginRight: "12px"
          }}
        />
        <ListItemText
          primary={
            <Typography variant="h6" style={{ fontWeight: isSelected ? "bold" : "normal" }}>
              {project.displayName || project.name}
            </Typography>
          }
        /> 
      </ListItemButton>
    </ListItem>
  )
}

export default ProjectListItem
