import { ListItem, ListItemButton, ListItemText, Stack, Typography } from "@mui/material"
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
          paddingLeft: 2,
          paddingRight: 2,
          paddingTop: 1.75,
          paddingBottom: 1.75
        }}
        disableGutters
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <ProjectAvatar
            project={project}
            width={40}
            height={40}
          />
          <ListItemText
            primary={
              <Typography variant="h6" style={{ fontWeight: isSelected ? "bold" : "normal" }}>
                {project.displayName}
              </Typography>
            }
          /> 
        </Stack>
      </ListItemButton>
    </ListItem>
  )
}

export default ProjectListItem
