"use client"

import { useRouter } from "next/navigation"
import SidebarContainer from "@/common/SidebarContainer"
import ProjectList from "./ProjectList"
import ProjectsPageSecondaryContent from "./ProjectsPageSecondaryContent"
import ProjectsPageTrailingToolbarItem from "./ProjectsPageTrailingToolbarItem"
import IProject from "../domain/IProject"
import { getProjectPageState } from "../domain/ProjectPageState"
import projectNavigator from "../domain/projectNavigator"
import useProjects from "../data/useProjects"

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
  const handleProjectSelected = (project: IProject) => {
    const version = project.versions[0]
    const specification = version.specifications[0]
    router.push(`/${project.id}/${version.id}/${specification.id}`)
  }
  return (
    <SidebarContainer
      primary={
        <ProjectList
          isLoading={isLoading}
          projects={projects}
          selectedProjectId={stateContainer.selection?.project.id}
          onSelectProject={handleProjectSelected}
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
