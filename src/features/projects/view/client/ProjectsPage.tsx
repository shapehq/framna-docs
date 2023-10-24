"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import SidebarContainer from "@/features/sidebar/view/client/SidebarContainer"
import Project from "../../domain/Project"
import ProjectList from "../ProjectList"
import ProjectsPageSecondaryContent from "../ProjectsPageSecondaryContent"
import ProjectsPageTrailingToolbarItem from "../ProjectsPageTrailingToolbarItem"
import { getProjectPageState } from "../../domain/ProjectPageState"
import projectNavigator from "../../domain/projectNavigator"
import updateWindowTitle from "../../domain/updateWindowTitle"
import useProjects from "../../data/useProjects"

export default function ProjectsPage({
  projects: serverProjects,
  projectId,
  versionId,
  specificationId
}: {
  projects?: Project[]
  projectId?: string
  versionId?: string
  specificationId?: string
}) {
  const router = useRouter()
  const { projects: clientProjects, error, isLoading: isClientLoading } = useProjects()
  const projects = isClientLoading ? (serverProjects || []) : clientProjects
  const isLoading = serverProjects === undefined && isClientLoading
  const stateContainer = getProjectPageState({
    isLoading,
    error,
    projects,
    selectedProjectId: projectId,
    selectedVersionId: versionId,
    selectedSpecificationId: specificationId
  })
  const handleProjectSelected = (project: Project) => {
    const version = project.versions[0]
    const specification = version.specifications[0]
    router.push(`/${project.id}/${version.id}/${specification.id}`)
  }
  useEffect(() => {
    updateWindowTitle(
      document,
      process.env.NEXT_PUBLIC_SHAPE_DOCS_TITLE,
      stateContainer.selection
    )
  }, [stateContainer.selection])
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
