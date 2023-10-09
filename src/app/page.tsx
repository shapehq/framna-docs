import { Auth0UserProvider } from '@/lib/auth/Auth0UserProvider'
import { Auth0UserDetailsProvider } from '@/lib/auth/Auth0UserDetailsProvider'
import { GitHubProjectRepository } from '@/lib/projects/GitHubProjectRepository'
import { IdentityAccessTokenProvider } from '@/lib/auth/IdentityAccessTokenProvider'
import Frontpage from '@/lib/pages/Frontpage'

export default async function Page() {
  return (
    <Frontpage
      userProvider={new Auth0UserProvider()}
      projectRepository={
        new GitHubProjectRepository(
          new IdentityAccessTokenProvider(
            new Auth0UserDetailsProvider(new Auth0UserProvider(), {
              domain: process.env.AUTH0_MANAGEMENT_DOMAIN,
              clientId: process.env.AUTH0_MANAGEMENT_CLIENT_ID,
              clientSecret: process.env.AUTH0_MANAGEMENT_CLIENT_SECRET
            }),
            "github"
          )
        )
      }
    />
  )
}
