"use client"
 
import { useContext } from "react"
import { SplitView } from "@/features/sidebar/view"
import { useProjects } from "@/features/projects/data"
// import MainContent from "@/features/projects/view/MainContent"
// import MobileToolbar from "@/features/projects/view/toolbar/MobileToolbar"
// import TrailingToolbarItem from "@/features/projects/view/toolbar/TrailingToolbarItem"

import {
  ProjectsContainerContext,
  ServerSideCachedProjectsContext
} from "@/common"

export default function Layout({ children }: { children: React.ReactNode }) {
  const { projects, error, isLoading } = useProjects()
  // Update projects provided to child components, using cached projects from the server if needed.
  const serverSideCachedProjects = useContext(ServerSideCachedProjectsContext)
  const newProjectsContainer = { projects, error, isLoading }
  if (isLoading && serverSideCachedProjects) {
    newProjectsContainer.isLoading = false
    newProjectsContainer.projects = serverSideCachedProjects
  }
  return (
    <ProjectsContainerContext.Provider value={newProjectsContainer}>
      <SplitView>
        {children}
      </SplitView>
    </ProjectsContainerContext.Provider>
  )
}
