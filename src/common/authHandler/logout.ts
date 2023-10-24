import ISessionOAuthTokenRepository from "@/features/auth/domain/ISessionOAuthTokenRepository"
import ISessionProjectRepository from "@/features/projects/domain/ISessionProjectRepository"

export default async function logoutHandler(
  sessionOAuthTokenRepository: ISessionOAuthTokenRepository,
  sessionProjectRepository: ISessionProjectRepository
) {
  await Promise.all([
    sessionOAuthTokenRepository.deleteOAuthToken().catch(() => null),
    sessionProjectRepository.deleteProjects().catch(() => null)
  ])
}
