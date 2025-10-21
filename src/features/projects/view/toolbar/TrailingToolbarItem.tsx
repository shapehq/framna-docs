"use client"

import { SxProps } from "@mui/system"
import { Stack, IconButton, Typography, Link, Tooltip, Divider } from "@mui/material"
import Selector from "./Selector"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPenToSquare } from "@fortawesome/free-regular-svg-icons"
import { useProjectSelection } from "../../data"

const TrailingToolbarItem = () => {
  const {
    project,
    version,
    specification,
    selectVersion,
    selectSpecification
  } = useProjectSelection()
  if (!project || !version || !specification) {
    return <></>
  }
  const projectNameURL = version.url || project.url
  return (
    <>
      <Stack
        direction="row"
        alignItems="center"
        sx={{ display: { sm: "flex", md: "none" } }}
      >
        <RepositoryPathItem
          text={project.owner}
          url={project.ownerUrl}
          sx={{ marginRight: 1 }}
        />
        <Typography variant="h6" sx={{ marginRight: 1 }}>/</Typography>
        <RepositoryPathItem text={project.name} url={projectNameURL} />
      </Stack>
      <Stack
        direction="row"
        alignItems="center"
        sx={{ display: { xs: "none", sm: "none", md: "flex" } }}
      >
        <RepositoryPathItem
          text={project.owner}
          url={project.ownerUrl}
          sx={{ marginRight: 1 }}
        />
        <Typography variant="h6" sx={{ marginRight: 1 }}>/</Typography>
        <RepositoryPathItem
          text={project.name}
          url={projectNameURL}
          sx={{ marginRight: 1 }}
        />
        <Typography variant="h6" sx={{ marginRight: 1 }}>/</Typography>
        <Selector
          items={project.versions}
          selection={version.id}
          onSelect={selectVersion}
          sx={{ marginRight: 1 }}
        />
        <Typography variant="h6" sx={{ marginRight: 1 }}>/</Typography>
        <Selector
          items={version.specifications}
          selection={specification.id}
          onSelect={selectSpecification}
          sx={{ marginRight: 0.5 }}
        />
        {specification.editURL &&
          <Divider orientation="vertical" flexItem sx={{ marginLeft: 1, marginRight: 1 }} />
        }
        {specification.editURL &&
          <Tooltip title={`Edit ${specification.name}`} sx={{ marginLeft: 0.5, marginRight: 0.5 }}>
            <IconButton
              href={specification.editURL}
              target="_blank"
              color="secondary"
              edge="end"
            >
              <FontAwesomeIcon
                icon={faPenToSquare}
                size="xs"
                style={{ aspectRatio: 1, padding: 2 }}
              />
            </IconButton>
          </Tooltip>
        }
        
      </Stack>
    </>
  )
}

export default TrailingToolbarItem

const RepositoryPathItem = ({
  url,
  text,
  sx
}: {
  url?: string
  text: string
  sx?: SxProps
}) => {
  if (url) {
    return (
      <Link
        variant="body1"
        color="inherit"
        underline="hover"
        href={url}
        target="_blank"
        sx={sx}
      >
        {text}
      </Link>
    )
  } else {
    return (
      <Typography variant="body1" sx={sx}>
        Test {text}
      </Typography>
    )
  }
}