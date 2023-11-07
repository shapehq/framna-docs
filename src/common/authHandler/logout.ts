import ISessionOAuthTokenRepository from "@/features/auth/domain/ISessionOAuthTokenRepository"
import IProjectRepository from "@/features/projects/domain/IProjectRepository"

export default async function logoutHandler(
  sessionOAuthTokenRepository: ISessionOAuthTokenRepository,
  projectRepository: IProjectRepository
) {
  await Promise.all([
    sessionOAuthTokenRepository.deleteOAuthToken().catch(() => null),
    projectRepository.delete().catch(() => null)
  ])
}
