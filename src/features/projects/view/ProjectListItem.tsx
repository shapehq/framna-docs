import {
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  Typography
} from "@mui/material"
import MenuItemHover from "@/common/ui/MenuItemHover"
import Project from "../domain/Project"
import ProjectAvatar from "./ProjectAvatar"

const ProjectListItem = ({
  project,
  isSelected,
  onSelectProject
}: {
  project: Project
  isSelected: boolean
  onSelectProject: (project: Project) => void
}) => {
  return (
    <ListItem disablePadding>
      <ListItemButton
        onClick={() => onSelectProject(project)}
        selected={isSelected}
        disableGutters
        sx={{
          padding: 0,
          marginTop: 0.5,
          marginBottom: 0.5
        }}
      >
        <MenuItemHover>
          <Stack direction="row" alignItems="center" spacing={1}>
            <ProjectAvatar project={project} width={40} height={40} />
            <ListItemText
              primary={
                <Typography
                  style={{
                    fontSize: "1.1em",
                    fontWeight: isSelected ? 800 : 500,
                    letterSpacing: 0.3
                  }}
                >
                  {project.displayName}
                </Typography>
              }
            /> 
          </Stack>
        </MenuItemHover>
      </ListItemButton>
    </ListItem>
  )
}

export default ProjectListItem
