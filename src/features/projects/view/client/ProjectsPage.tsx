"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "@mui/material/styles"
import useMediaQuery from "@mui/material/useMediaQuery"
import SidebarContainer from "@/features/sidebar/view/client/SidebarContainer"
import { useProjects } from "../../data"
import { Project, getSelection, projectNavigator, updateWindowTitle } from "../../domain"
import ProjectList from "../ProjectList"
import MainContent from "../MainContent"
import MobileToolbar from "../toolbar/MobileToolbar"
import TrailingToolbarItem from "../toolbar/TrailingToolbarItem"
import useSidebarOpen from "@/common/state/useSidebarOpen"

export default function ProjectsPage({
  enableGitHubLinks,
  projects: serverProjects,
  projectId,
  versionId,
  specificationId
}: {
  enableGitHubLinks: boolean,
  projects?: Project[]
  projectId?: string
  versionId?: string
  specificationId?: string
}) {
  const router = useRouter()
  const theme = useTheme()
  const [isSidebarOpen, setSidebarOpen] = useSidebarOpen()
  const isDesktopLayout = useMediaQuery(theme.breakpoints.up("sm"))
  const { projects: clientProjects, error, isLoading: isClientLoading } = useProjects()
  const projects = isClientLoading ? (serverProjects || []) : clientProjects
  const { project, version, specification } = getSelection({
    projects,
    projectId,
    versionId,
    specificationId
  })
  useEffect(() => {
    updateWindowTitle({
      storage: document,
      defaultTitle: process.env.NEXT_PUBLIC_SHAPE_DOCS_TITLE,
      project,
      version,
      specification
    })
  }, [project, version, specification])
  useEffect(() => {
    // Ensure the URL reflects the current selection of project, version, and specification.
    const urlSelection = { projectId, versionId, specificationId }
    const selection = {
      projectId: project?.id,
      versionId: version?.id,
      specificationId: specification?.id
    }
    projectNavigator.navigateIfNeeded(router, urlSelection, selection)
  }, [router, projectId, versionId, specificationId, project, version, specification])
  useEffect(() => {
    // Show the sidebar if no project is selected.
    if (projectId === undefined) {
      setSidebarOpen(true)
    }
  }, [projectId, setSidebarOpen])
  const selectProject = (project: Project) => {
    if (!isDesktopLayout) {
      setSidebarOpen(false)
    }
    const version = project.versions[0]
    const specification = version.specifications[0]
    projectNavigator.navigate(router, project.id, version.id, specification.id)
  }
  const selectVersion = (versionId: string) => {
    projectNavigator.navigateToVersion(router, project!, versionId, specification!.name)
  }
  const selectSpecification = (specificationId: string) => {
    projectNavigator.navigate(router, projectId!, versionId!, specificationId)
  }
  const canCloseSidebar = projectId !== undefined
  const toggleSidebar = (isOpen: boolean) => {
    if (!isOpen && canCloseSidebar) {
      setSidebarOpen(false)
    } else if (isOpen) {
      setSidebarOpen(true)
    }
  }
  return (
    <SidebarContainer
      showHeader={canCloseSidebar}
      isSidebarOpen={isSidebarOpen}
      onToggleSidebarOpen={toggleSidebar}
      sidebar={
        <ProjectList
          isLoading={serverProjects === undefined && isClientLoading}
          projects={projects}
          selectedProjectId={projectId}
          onSelectProject={selectProject}
        />
      }
      toolbarTrailingItem={project && version && specification &&
        <TrailingToolbarItem
          enableGitHubLinks={enableGitHubLinks}
          project={project}
          version={version}
          specification={specification}
          onSelectVersion={selectVersion}
          onSelectSpecification={selectSpecification}
        />
      }
      mobileToolbar={project && version && specification &&
        <MobileToolbar
          project={project}
          version={version}
          specification={specification}
          onSelectVersion={selectVersion}
          onSelectSpecification={selectSpecification}
        />
      }
    >
      {/* If the user has not selected any project then we do not render any content */} 
      {projectId &&
        <MainContent
          isLoading={isClientLoading}
          error={error}
          project={project}
          version={version}
          specification={specification}
        />
      }
    </SidebarContainer>
  )
}
