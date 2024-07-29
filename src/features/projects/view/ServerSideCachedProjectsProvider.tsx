"use client"

import { Project } from "../domain"
import { ServerSideCachedProjectsContext } from "@/common"

const ServerSideCachedProjectsProvider = ({
  projects,
  children
}: {
  projects: Project[] | undefined
  children: React.ReactNode
}) => {
  return (
    <ServerSideCachedProjectsContext.Provider value={projects}>
      {children}
    </ServerSideCachedProjectsContext.Provider>
  )
}

export default ServerSideCachedProjectsProvider
