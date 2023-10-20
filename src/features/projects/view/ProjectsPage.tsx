"use client"

import { useRouter } from "next/navigation"
import SidebarContainer from "@/common/SidebarContainer"
import ProjectList from "./ProjectList"
import ProjectsPageSecondaryContent from "./ProjectsPageSecondaryContent"
import ProjectsPageTrailingToolbarItem from "./ProjectsPageTrailingToolbarItem"
import useProjects from "../data/useProjects"
import { getProjectPageState } from "../domain/ProjectPageState"
import projectNavigator from "../domain/projectNavigator"

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
  const stateContainer = getProjectPageState({
    isLoading,
    error,
    projects,
    selectedProjectId: projectId,
    selectedVersionId: versionId,
    selectedSpecificationId: specificationId
  })
  // Ensure the URL reflects the current selection of project, version, and specification.
  if (stateContainer.selection) {
    const candidateSelection = { projectId, versionId, specificationId }
    projectNavigator.navigateToCurrentSelection(
      candidateSelection,
      stateContainer.selection,
      router
    )
  }
  return (
    <SidebarContainer
      primary={
        <ProjectList
          isLoading={isLoading}
          projects={projects}
          selectedProjectId={stateContainer.selection?.project.id}
        />
      }
      secondary={
        <ProjectsPageSecondaryContent stateContainer={stateContainer} />  
      }
      toolbarTrailing={
        <ProjectsPageTrailingToolbarItem
          stateContainer={stateContainer}
          onSelectVersion={(versionId: string) => {
            projectNavigator.navigateToVersion(stateContainer.selection!, versionId, router)
          }}
          onSelectSpecification={(specificationId: string) => {
            projectNavigator.navigateToSpecification(stateContainer.selection!, specificationId, router)
          }}
        />
      }
    />
  )
}
