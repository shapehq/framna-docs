import {
  Box,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  Typography
} from "@mui/material"
import { alpha, useTheme } from "@mui/material/styles"
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
  const theme = useTheme()
  return (
    <ListItem disablePadding>
      <ListItemButton
        onClick={() => onSelectProject(project)}
        selected={isSelected}
        disableGutters
        sx={{
          padding: 0,
          "&:hover .hover-background": {
            background: alpha(theme.palette.text.primary, 0.05)
          }
        }}
      >
        <Box
          className="hover-background"
          sx={{
            width: "100%",
            marginLeft: 1,
            marginRight: 1,
            marginTop: 0.5,
            marginBottom: 0.5,
            borderRadius: "12px"
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{
              paddingLeft: 1,
              paddingRight: 1,
              paddingTop: 1,
              paddingBottom: 1
            }}
            >
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
        </Box>
      </ListItemButton>
    </ListItem>
  )
}

export default ProjectListItem
