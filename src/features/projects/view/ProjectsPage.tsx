"use client"

import { Typography, Stack } from "@mui/material"
import { LibraryBooks } from "@mui/icons-material"
import SidebarContainer from "@/common/SidebarContainer"
import ProjectList from "./ProjectList"
import ProjectSecondaryContent from "./ProjectSecondaryContent"
import useProjects from "../data/useProjects"
import { getProjectSelection } from "../domain/ProjectSelection"

interface ProjectsPageProps {
  readonly projectId?: string
  readonly versionId?: string
  readonly specificationId?: string
}

export default function ProjectsPage(
  { projectId, versionId, specificationId }: ProjectsPageProps
) {
  const { projects, isLoading } = useProjects()
  const projectSelection = getProjectSelection(
    isLoading,
    projects,
    projectId,
    versionId,
    specificationId
  )
  return (
    <SidebarContainer
      primaryHeader={
        <Stack direction="row" alignItems="center" spacing={1}>
          <LibraryBooks/>
          <Typography variant="h6">
            Projects
          </Typography>
        </Stack>
      }
      primary={
        <ProjectList
          isLoading={isLoading}
          projects={projects}
          selectedProjectId={projectSelection.selection?.project.id}
        />
      }
      secondary={
        <ProjectSecondaryContent projectSelection={projectSelection}/>
      }
    />
  )
}
