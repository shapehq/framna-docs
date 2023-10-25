"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import SidebarContainer from "@/features/sidebar/view/client/SidebarContainer"
import Project from "../../domain/Project"
import ProjectList from "../ProjectList"
import ProjectsPageContent from "../ProjectsPageContent"
import TrailingToolbarItem from "../TrailingToolbarItem"
import MobileToolbar from "../MobileToolbar"
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
    projectNavigator.navigate(router, project.id, version.id, specification.id)
  }
  useEffect(() => {
    updateWindowTitle(
      document,
      process.env.NEXT_PUBLIC_SHAPE_DOCS_TITLE,
      stateContainer.selection
    )
  }, [stateContainer.selection])
  useEffect(() => {
    if (!stateContainer.selection) {
      return
    }
    // Ensure the URL reflects the current selection of project, version, and specification.
    const urlSelection = { projectId, versionId, specificationId }
    projectNavigator.navigateIfNeeded(router, urlSelection, stateContainer.selection)
  }, [router, projectId, versionId, specificationId, stateContainer.selection])
  const selectVersion = (versionId: string) => {
    projectNavigator.navigateToVersion(router, stateContainer.selection!, versionId)
  }
  const selectSpecification = (specificationId: string) => {
    projectNavigator.navigate(router, projectId!, versionId!, specificationId)
  }
  return (
    <SidebarContainer
      sidebar={
        <ProjectList
          isLoading={isLoading}
          projects={projects}
          selectedProjectId={projectId}
          onSelectProject={handleProjectSelected}
        />
      }
      toolbarTrailingItem={stateContainer.selection &&
        <TrailingToolbarItem
          project={stateContainer.selection.project}
          version={stateContainer.selection.version}
          specification={stateContainer.selection.specification}
          onSelectVersion={selectVersion}
          onSelectSpecification={selectSpecification}
        />
      }
      mobileToolbar={stateContainer.selection &&
        <MobileToolbar
          project={stateContainer.selection.project}
          version={stateContainer.selection.version}
          specification={stateContainer.selection.specification}
          onSelectVersion={selectVersion}
          onSelectSpecification={selectSpecification}
        />
      }
    >
      <ProjectsPageContent stateContainer={stateContainer} />  
    </SidebarContainer>
  )
}
