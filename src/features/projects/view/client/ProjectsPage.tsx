"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "@mui/material/styles"
import useMediaQuery from "@mui/material/useMediaQuery"
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
  const theme = useTheme()
  const isDesktopLayout = useMediaQuery(theme.breakpoints.up("sm"))
  const { projects: clientProjects, error, isLoading: isClientLoading } = useProjects()
  const [forceCloseSidebar, setForceCloseSidebar] = useState(false)
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
  const selectProject = (project: Project) => {
    setForceCloseSidebar(!isDesktopLayout)
    const version = project.versions[0]
    const specification = version.specifications[0]
    projectNavigator.navigate(router, project.id, version.id, specification.id)
  }
  const selectVersion = (versionId: string) => {
    projectNavigator.navigateToVersion(router, stateContainer.selection!, versionId)
  }
  const selectSpecification = (specificationId: string) => {
    projectNavigator.navigate(router, projectId!, versionId!, specificationId)
  }
  return (
    <SidebarContainer
      canCloseDrawer={stateContainer.selection !== undefined}
      forceClose={forceCloseSidebar}
      sidebar={
        <ProjectList
          isLoading={isLoading}
          projects={projects}
          selectedProjectId={projectId}
          onSelectProject={selectProject}
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
