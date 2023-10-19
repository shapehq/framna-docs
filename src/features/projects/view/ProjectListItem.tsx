import { useRouter } from "next/navigation"
import { ListItem, ListItemButton, ListItemText, Typography } from "@mui/material"
import IProject from "../domain/IProject"
import ProjectAvatar from "./ProjectAvatar"

interface ProjectListItemProps<ProjectType extends IProject> {
  readonly project: ProjectType
  readonly isSelected: boolean
  readonly divider?: boolean
}

const ProjectListItem = <ProjectType extends IProject>(
  {
    project,
    isSelected,
    divider
  }: ProjectListItemProps<ProjectType>
) => {
  const router = useRouter()
  return (
    <ListItem disablePadding divider={divider || false}>
      <ListItemButton
        onClick={() => router.push(`/${project.id}`)}
        selected={isSelected}
        sx={{
          background: isSelected ? "#0000000a" : "none",
          paddingLeft: "15px",
          paddingRight: "15px",
          paddingTop: "10px",
          paddingBottom: "10px"
        }}
        disableGutters
      >
        <ProjectAvatar
          project={project}
          sx={{
            width: 35,
            height: 35,
            marginRight: "10px"
          }}
        />
        <ListItemText
          primary={
            <Typography style={{ fontWeight: isSelected ? "bold" : "normal" }}>
              {project.name}
            </Typography>
          }
        /> 
      </ListItemButton>
    </ListItem>
  )
}

export default ProjectListItem
