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
  const enableGitHubLinks = await session.getAccountProvider() == "github"
  const projects = await projectRepository.get()
  return (
    <ClientProjectsPage
      enableGitHubLinks={enableGitHubLinks}
      projects={projects}
      path={path}
    />
  )
}
