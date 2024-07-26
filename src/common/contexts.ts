"use client"

import { createContext } from "react"
import { Project, } from "@/features/projects/domain"

type ProjectsContainer = {
  readonly projects: Project[]
  readonly isLoading: boolean
  readonly error?: Error
}

export const ProjectsContainerContext = createContext<ProjectsContainer>({
  isLoading: true,
  projects: []
})

export const ServerSideCachedProjectsContext = createContext<Project[] | undefined>(undefined)
