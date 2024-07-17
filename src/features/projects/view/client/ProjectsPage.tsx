"use client"

import { useEffect } from "react"
import { useTheme } from "@mui/material/styles"
import useMediaQuery from "@mui/material/useMediaQuery"
import SidebarContainer from "@/features/sidebar/view/client/SidebarContainer"
import { useProjects } from "../../data"
import ProjectList from "../ProjectList"
import MainContent from "../MainContent"
import MobileToolbar from "../toolbar/MobileToolbar"
import TrailingToolbarItem from "../toolbar/TrailingToolbarItem"
import useSidebarOpen from "@/common/state/useSidebarOpen"
import {
  Project,
  getSelection,
  updateWindowTitle,
  useProjectNavigator
} from "../../domain"

export default function ProjectsPage({
  projects: serverProjects,
  path
}: {
  projects?: Project[]
  path: string
}) {
  const theme = useTheme()
  const projectNavigator = useProjectNavigator()
  const [isSidebarOpen, setSidebarOpen] = useSidebarOpen()
  const isDesktopLayout = useMediaQuery(theme.breakpoints.up("sm"))
  const { projects: clientProjects, error, isLoading: isClientLoading } = useProjects()
  const projects = isClientLoading ? (serverProjects || []) : clientProjects
  const { project, version, specification } = getSelection({ projects, path })
  const siteName = process.env.NEXT_PUBLIC_SHAPE_DOCS_TITLE || ""
  useEffect(() => {
    updateWindowTitle({
      storage: document,
      defaultTitle: siteName,
      project,
      version,
      specification
    })
  }, [project, version, specification])
  useEffect(() => {
    // Ensure the URL reflects the current selection of project, version, and specification.
    projectNavigator.navigateIfNeeded({
      projectOwner: project?.owner,
      projectName: project?.name,
      versionId: version?.id,
      specificationId: specification?.id
    })
  }, [projectNavigator, project, version, specification])
  useEffect(() => {
    // Show the sidebar if no project is selected.
    if (project === undefined) {
      setSidebarOpen(true)
    }
  }, [project, setSidebarOpen])
  const selectProject = (project: Project) => {
    if (!isDesktopLayout) {
      setSidebarOpen(false)
    }
    const version = project.versions[0]
    const specification = version.specifications[0]
    projectNavigator.navigate(project.owner, project.name, version.id, specification.id)
  }
  const selectVersion = (versionId: string) => {
    projectNavigator.navigateToVersion(project!, versionId, specification!.name)
  }
  const selectSpecification = (specificationId: string) => {
    projectNavigator.navigate(project!.owner, project!.name, version!.id, specificationId)
  }
  const canCloseSidebar = project !== undefined
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
          selectedProjectId={project?.id}
          onSelectProject={selectProject}
        />
      }
      toolbarTrailingItem={project && version && specification &&
        <TrailingToolbarItem
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
      {project &&
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