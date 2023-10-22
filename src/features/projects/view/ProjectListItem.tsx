import { ListItem, ListItemButton, ListItemText, Typography } from "@mui/material"
import IProject from "../domain/IProject"
import ProjectAvatar from "./ProjectAvatar"

interface ProjectListItemProps<ProjectType extends IProject> {
  readonly project: ProjectType
  readonly isSelected: boolean
  readonly onSelectProject: (project: IProject) => void
}

const ProjectListItem = <ProjectType extends IProject>(
  {
    project,
    isSelected,
    onSelectProject
  }: ProjectListItemProps<ProjectType>
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
