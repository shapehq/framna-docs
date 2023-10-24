import SessionProjectRepository from "../domain/SessionProjectRepository"
import ClientProjectsPage from "./client/ProjectsPage"

export default async function ProjectsPage({
  sessionProjectRepository,
  projectId,
  versionId,
  specificationId
}: {
  sessionProjectRepository: SessionProjectRepository
  projectId?: string
  versionId?: string
  specificationId?: string
}) {
  const projects = await sessionProjectRepository.getProjects()
  return (
    <ClientProjectsPage
      projects={projects}
      projectId={projectId}
      versionId={versionId}
      specificationId={specificationId}
    />
  )
}
