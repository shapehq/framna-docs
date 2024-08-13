import {
  Box,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  Typography
} from "@mui/material"
import MenuItemHover from "@/common/ui/MenuItemHover"
import { Project } from "@/features/projects/domain"
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
        sx={{ padding: 0 }}
      >
        <MenuItemHover
          sx={{
            ".avatar": {
              transform: "scale(1)",
              transition: "transform 0.3s ease-in-out"
            },
            "&:hover .avatar": {
              transform: "scale(1.08)"
            }
          }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box className="avatar">
              <ProjectAvatar project={project} width={40} height={40} />
            </Box>
            <ListItemText
              primary={
                <Typography
                  variant="body2"
                  style={{
                    fontWeight: isSelected ? 800 : 500,
                    letterSpacing: 0.1,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
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
