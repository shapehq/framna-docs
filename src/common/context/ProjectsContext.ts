"use client"

import { createContext } from "react"
import { Project } from "@/features/projects/domain"

export const SidebarTogglableContext = createContext<boolean>(true)

type ProjectsContextValue = {
  cached: boolean,
  projects: Project[],
  setProjects: (projects: Project[]) => void
}

export const ProjectsContext = createContext<ProjectsContextValue>({
  cached: true,
  projects: [],
  setProjects: () => {}
})
