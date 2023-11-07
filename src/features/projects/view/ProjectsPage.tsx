import ProjectRepository from "../domain/ProjectRepository"
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
  const projects = await projectRepository.get()
  return (
    <ClientProjectsPage
      projects={projects}
      projectId={projectId}
      versionId={versionId}
      specificationId={specificationId}
    />
  )
}
