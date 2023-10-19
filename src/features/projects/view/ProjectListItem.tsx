import { useRouter } from "next/navigation"
import { ListItem, ListItemButton, ListItemText, Typography } from "@mui/material"
import IProject from "../domain/IProject"
import ProjectAvatar from "./ProjectAvatar"

interface ProjectListItemProps<ProjectType extends IProject> {
  readonly project: ProjectType
  readonly isSelected: boolean
}

const ProjectListItem = <ProjectType extends IProject>(
  {
    project,
    isSelected
  }: ProjectListItemProps<ProjectType>
) => {
  const router = useRouter()
  return (
    <ListItem disablePadding>
      <ListItemButton
        onClick={() => router.push(`/${project.id}`)}
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
              {project.name}
            </Typography>
          }
        /> 
      </ListItemButton>
    </ListItem>
  )
}

export default ProjectListItem
