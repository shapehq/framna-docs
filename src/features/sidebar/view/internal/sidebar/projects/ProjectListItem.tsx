import {
  Box,
  ListItem,
  ListItemText,
  ListItemButton,
  Skeleton as MuiSkeleton,
  Stack,
  Typography
} from "@mui/material"
import MenuItemHover from "@/common/ui/MenuItemHover"
import { Project } from "@/features/projects/domain"
import ProjectAvatar from "./ProjectAvatar"
import ProjectAvatarSquircle from "./ProjectAvatarSquircle"

const AVATAR_SIZE = { width: 40, height: 40 }

const ProjectListItem = ({
  project,
  selected,
  onSelect
}: {
  project: Project
  selected: boolean
  onSelect: () => void
}) => {
  return (
    <Template
      selected={selected}
      onSelect={onSelect}
      avatar={<ProjectAvatar project={project} width={40} height={40} />}
    >
      <ListItemText
        primary={
          <Typography
            style={{
              fontSize: "1.1em",
              fontWeight: selected ? 800 : 500,
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
    </Template>
  )
}

export default ProjectListItem

export const Skeleton = () => {
  return (
    <Template disabled avatar={
      <MuiSkeleton
        variant="rectangular"
        animation="wave"
        sx={{ width: "100%", height: "100%" }}
      />
    }>
      <MuiSkeleton variant="text" animation="wave" width={100} />
    </Template>
  )
}

const Template = ({
  disabled,
  selected,
  onSelect,
  avatar,
  children
}: {
  disabled?: boolean
  selected?: boolean
  onSelect?: () => void
  avatar: React.ReactNode
  children?: React.ReactNode
}) => {
  return (
    <ListItem disablePadding>
      {disabled &&
        <ButtonLabel disabled={disabled} avatar={avatar}>
          {children}
        </ButtonLabel>
      }
      {!disabled &&
      <ListItemButton
        disabled={disabled}
        onClick={onSelect}
        selected={selected}
        disableGutters
        sx={{ padding: 0 }}
      >
        <ButtonLabel disabled={disabled} avatar={avatar}>
          {children}
        </ButtonLabel>
      </ListItemButton>
      }
    </ListItem>
  )
}

const ButtonLabel = ({
  disabled,
  avatar,
  children
}: {
  disabled?: boolean
  avatar: React.ReactNode
  children?: React.ReactNode
}) => {
  return (
    <MenuItemHover
      disabled={disabled}
      sx={{
        ".avatar": {
          transform: "scale(1)",
          transition: "transform 0.3s ease-in-out"
        },
        "&:hover .avatar": {
          transform: `scale(${disabled ? 1 : 1.08})`
        }
      }}>
      <Stack direction="row" alignItems="center" spacing={1.5}>
        <Box className="avatar">
          <ProjectAvatarSquircle
            width={AVATAR_SIZE.width}
            height={AVATAR_SIZE.height}
            sx={{ position: "relative" }}
          >
            {avatar}
          </ProjectAvatarSquircle>
        </Box>
        {children}
      </Stack>
    </MenuItemHover>
  )
}
