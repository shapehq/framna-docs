"use client"

import { useRouter, usePathname } from "next/navigation"
import { useContext } from "react"
import useMediaQuery from "@mui/material/useMediaQuery"
import { useTheme } from "@mui/material/styles"
import { ProjectsContainerContext } from "@/common"
import { Project, ProjectNavigator, getProjectSelectionFromPath } from "../domain"
import { useSidebarOpen } from "@/features/sidebar/data"

export default function useProjectSelection() {
  const router = useRouter()
  const pathname = usePathname()
  const { projects } = useContext(ProjectsContainerContext)
  const selection = getProjectSelectionFromPath({ projects, path: pathname })
  const pathnameReader = {
    get pathname() {
      return pathname
    }
  }
  const projectNavigator = new ProjectNavigator({ router, pathnameReader })
  const [, setSidebarOpen] = useSidebarOpen()
  const theme = useTheme()
  const isDesktopLayout = useMediaQuery(theme.breakpoints.up("sm"))
  return {
    get project() {
      return selection.project
    },
    get version() {
      return selection.version
    },
    get specification() {
      return selection.specification
    },
    selectProject: (project: Project) => {
      if (!isDesktopLayout) {
        setSidebarOpen(false)
      }
      const version = project.versions[0]
      const specification = version.specifications[0]
      projectNavigator.navigate(
        project.owner,
        project.name,
        version.id,
        specification.id
      )
    },
    selectVersion: (versionId: string) => {
      projectNavigator.navigateToVersion(
        selection.project!,
        versionId,
        selection.specification!.name
      )
    },
    selectSpecification: (specificationId: string) => {
      projectNavigator.navigate(
        selection.project!.owner,
        selection.project!.name,
        selection.version!.id, specificationId
      )
    },
    navigateToSelectionIfNeeded: () => {
      projectNavigator.navigateIfNeeded({
        projectOwner: selection.project?.owner,
        projectName: selection.project?.name,
        versionId: selection.version?.id,
        specificationId: selection.specification?.id
      })
    }
  }
}
