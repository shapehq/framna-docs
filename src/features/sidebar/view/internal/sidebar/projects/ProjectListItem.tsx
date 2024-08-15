"use client"

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
import { useProjectSelection } from "@/features/projects/data"

const AVATAR_SIZE = { width: 40, height: 40 }

const ProjectListItem = ({ project }: { project: Project }) => {
  const { project: selectedProject, selectProject } = useProjectSelection()
  const selected = project.id === selectedProject?.id
  return (
    <Template
      selected={selected}
      onSelect={() => selectProject(project)}
      avatar={
        <ProjectAvatar
          project={project}
          width={AVATAR_SIZE.width}
          height={AVATAR_SIZE.height}
        />
      }
      title={project.displayName}
    />
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

export const Template = ({
  disabled,
  selected,
  onSelect,
  avatar,
  title,
  children
}: {
  disabled?: boolean
  selected?: boolean
  onSelect?: () => void
  avatar: React.ReactNode
  title?: string
  children?: React.ReactNode
}) => {
  return (
    <ListItem disablePadding>
      <Button
        disabled={disabled}
        selected={selected}
        onSelect={onSelect}
      >
        <MenuItemHover disabled={disabled}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box sx={{ width: 40, height: 40 }}>
              {avatar}
            </Box>
            {title &&
              <ListItemText
                primary={
                  <Typography
                    variant="body2"
                    style={{
                      fontWeight: selected ? 700 : 500,
                      letterSpacing: 0.1,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis"
                    }}
                  >
                    {title}
                  </Typography>
                }
              />
            }
            {children}
          </Stack>
        </MenuItemHover>
      </Button>
    </ListItem>
  )
}

const Button = ({
  disabled,
  selected,
  onSelect,
  children
}: {
  disabled?: boolean
  selected?: boolean
  onSelect?: () => void
  children?: React.ReactNode
}) => {
  return (
    <>
      {disabled && children}
      {!disabled &&
        <ListItemButton
          disabled={disabled}
          onClick={onSelect}
          selected={selected}
          disableGutters
          sx={{ padding: 0 }}
        >
          {children}
        </ListItemButton>
      }
    </>
  )
}
