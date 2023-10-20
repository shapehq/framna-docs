"use client"

import { useRouter } from "next/navigation"
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
  const router = useRouter()
  const { projects, error, isLoading } = useProjects()
  const projectSelection = getProjectSelection({
    isLoading,
    error,
    projects,
    selectedProjectId: projectId,
    selectedVersionId: versionId,
    selectedSpecificationId: specificationId
  })
  // Ensure the URL reflects the current selection of project, version, and specification.
  const currentSelection = projectSelection.selection
  if (currentSelection != null && (
    currentSelection?.project.id != projectId ||
    currentSelection?.version.id != versionId ||
    currentSelection?.specification.id != specificationId
  )) {
    router.replace(
      `/${currentSelection.project.id}/${currentSelection.version.id}/${currentSelection.specification.id}`
    )
  }
  return (
    <SidebarContainer
      primary={
        <ProjectList
          isLoading={isLoading}
          projects={projects}
          selectedProjectId={currentSelection?.project.id}
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
