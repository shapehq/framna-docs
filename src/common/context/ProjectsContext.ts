"use client"

import { createContext } from "react"
import { Project } from "@/features/projects/domain"

export const SidebarTogglableContext = createContext<boolean>(true)

type ProjectsContextValue = {
  refreshing: boolean,
  projects: Project[],
  refreshProjects: () => void,
}

export const ProjectsContext = createContext<ProjectsContextValue>({
  refreshing: false,
  projects: [],
  refreshProjects: () => {},
})
