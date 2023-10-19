"use client"

import SidebarContainer from "@/common/SidebarContainer"
import ProjectList from "./ProjectList"
import ProjectSecondaryContent from "./ProjectSecondaryContent"
import ProjectToolbarTrailingItem from "./ProjectToolbarTrailingItem"
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
      toolbarTrailing={
        <ProjectToolbarTrailingItem projectSelection={projectSelection} />
      }
    />
  )
}
