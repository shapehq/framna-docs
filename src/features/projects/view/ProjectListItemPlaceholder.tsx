import { ListItem, ListItemText, Stack, Skeleton } from "@mui/material"
import MenuItemHover from "@/common/ui/MenuItemHover"
import ProjectAvatarSquircleClip from "./ProjectAvatarSquircleClip"

const ProjectListItemPlaceholder = () => {
  return (
    <ListItem>
      <MenuItemHover disabled>
        <Stack
        direction="row" alignItems="center" spacing={1}
        sx={{
          padding: 0,
          marginTop: 0.5,
          marginBottom: 0.5
        }}
        >
          <ProjectAvatarSquircleClip
            width={42}
            height={42}
            sx={{
              // Offset the squircle to make it align with
              // the border of the actual avatar when loaded.
              position: "relative",
              left: "-1px",
              top: "-1px"
          }}
          >
            <Skeleton
              variant="rectangular"
              animation="wave"
              sx={{ width: 42, height: 42 }}
            />
          </ProjectAvatarSquircleClip>
          <ListItemText
            sx={{
              position: "relative",
              top: "-2px"
            }}
            primary={
              <Skeleton
                variant="text"
                animation="wave"
                width={100}
              />
            }
          />
        </Stack>
      </MenuItemHover>
    </ListItem>
  )
}

export default ProjectListItemPlaceholder