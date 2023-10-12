import { Auth0UserProvider } from '@/lib/auth/Auth0UserProvider'
import { Auth0UserDetailsProvider } from '@/lib/auth/Auth0UserDetailsProvider'
import { GitHubProjectRepository } from '@/lib/projects/GitHubProjectRepository'
import { HardcodedGitHubOrganizationNameProvider } from '@/lib/github/HardcodedGitHubOrganizationNameProvider'
import { DeferredGitHubClient } from '@/lib/github/DeferredGitHubClient'
import { OctokitGitHubClient } from '@/lib/github/OctokitGitHubClient'
import { IdentityAccessTokenProvider } from '@/lib/auth/IdentityAccessTokenProvider'
import Frontpage from '@/lib/pages/Frontpage'

export default async function Page() {
  return (
    <Frontpage
      userProvider={new Auth0UserProvider()}
      projectRepository={
        new GitHubProjectRepository(
          new DeferredGitHubClient(
            new HardcodedGitHubOrganizationNameProvider("shapehq"),
            new IdentityAccessTokenProvider(
              new Auth0UserDetailsProvider(new Auth0UserProvider(), {
                domain: process.env.AUTH0_MANAGEMENT_DOMAIN,
                clientId: process.env.AUTH0_MANAGEMENT_CLIENT_ID,
                clientSecret: process.env.AUTH0_MANAGEMENT_CLIENT_SECRET
              }),
              "github"
            ),
            (accessToken: string, organizationName: string) => {
              return new OctokitGitHubClient(accessToken, organizationName)
            }
          )
        )
      }
    />
  )
}
