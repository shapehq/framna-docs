import { session } from "@/composition"
import { ProjectRepository } from "../domain"
import ClientProjectsPage from "./client/ProjectsPage"

export default async function ProjectsPage({
  projectRepository,
  projectId,
  versionId,
  specificationId
}: {
  projectRepository: ProjectRepository
  projectId?: string
  versionId?: string
  specificationId?: string
}) {
  const isGuest = await session.getIsGuest()
  const projects = await projectRepository.get()
  return (
    <ClientProjectsPage
      showEditButton={!isGuest}
      projects={projects}
      projectId={projectId}
      versionId={versionId}
      specificationId={specificationId}
    />
  )
}
