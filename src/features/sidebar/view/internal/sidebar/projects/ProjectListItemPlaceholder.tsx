import { ListItem, ListItemText, Stack, Skeleton } from "@mui/material"
import MenuItemHover from "@/common/ui/MenuItemHover"
import ProjectAvatarSquircle from "./ProjectAvatarSquircle"

const ProjectListItemPlaceholder = () => {
  return (
    <ListItem>
      <MenuItemHover disabled>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <ProjectAvatarSquircle width={40} height={40}>
            <Skeleton
              variant="rectangular"
              animation="wave"
              sx={{ width: 40, height: 40 }}
            />
          </ProjectAvatarSquircle>
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