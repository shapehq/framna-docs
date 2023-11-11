import { session } from "@/composition"
import { ProjectRepository } from "../domain"
import ClientProjectsPage from "./client/ProjectsPage"

export default async function ProjectsPage({
  projectRepository,
  path
}: {
  projectRepository: ProjectRepository
  path: string
}) {
  const isGuest = await session.getIsGuest()
  const projects = await projectRepository.get()
  return (
    <ClientProjectsPage
      enableGitHubLinks={!isGuest}
      projects={projects}
      path={path}
    />
  )
}
