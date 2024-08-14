import { createContext } from "react"
import { Project } from "@/features/projects/domain"

type ProjectsContextValue = {
  projects: Project[],
  setProjects: (projects: Project[]) => void
}

export const ProjectsContext = createContext<ProjectsContextValue>({
  projects: [],
  setProjects: () => {}
})
