import { Pool } from "pg"
import { NextAuthOptions } from "next-auth"
import GithubProvider from "next-auth/providers/github"
import EmailProvider from "next-auth/providers/email"
import PostgresAdapter from "@auth/pg-adapter"
import { Adapter } from "next-auth/adapters"
import RedisKeyedMutexFactory from "@/common/mutex/RedisKeyedMutexFactory"
import RedisKeyValueStore from "@/common/keyValueStore/RedisKeyValueStore"
import {
  AccessTokenRefreshingGitHubClient,
  AuthjsSession,
  GitHubClient,
  ISession,
  KeyValueUserDataRepository,
  PostgreSQLDB,
  SessionMutexFactory
} from "@/common"
import {
  GitHubProjectDataSource
} from "@/features/projects/data"
import {
  CachingProjectDataSource,
  ProjectRepository
} from "@/features/projects/domain"
import {
  GitHubOAuthTokenRefresher,
  AuthjsOAuthTokenRepository,
  AuthjsRepositoryAccessReader,
  GitHubInstallationAccessTokenDataSource
} from "@/features/auth/data"
import {
  AccessTokenRefresher,
  AccessTokenSessionValidator,
  CompositeLogOutHandler,
  ErrorIgnoringLogOutHandler,
  GitHubOrganizationSessionValidator,
  LockingAccessTokenRefresher,
  NullObjectLogInHandler,
  OAuthTokenRepository,
  TransferringAccessTokenReader,
  UserDataCleanUpLogOutHandler
} from "@/features/auth/domain"
import { IGuestInviter } from "./features/admin/domain/IGuestInviter"
import { createTransport } from "nodemailer"
import DbGuestRepository from "./features/admin/data/DbGuestRepository"

const {
  GITHUB_APP_ID,
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  GITHUB_PRIVATE_KEY_BASE_64,
  GITHUB_ORGANIZATION_NAME,
  REDIS_URL,
  POSTGRESQL_HOST,
  POSTGRESQL_USER,
  POSTGRESQL_DB
} = process.env

const gitHubAppCredentials = {
  appId: GITHUB_APP_ID,
  clientId: GITHUB_CLIENT_ID,
  clientSecret: GITHUB_CLIENT_SECRET,
  privateKey: Buffer
    .from(GITHUB_PRIVATE_KEY_BASE_64, "base64")
    .toString("utf-8"),
  organization: GITHUB_ORGANIZATION_NAME,
}

const pool = new Pool({
  host: POSTGRESQL_HOST,
  user: POSTGRESQL_USER,
  database: POSTGRESQL_DB,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
})

const db = new PostgreSQLDB({ pool })

const logInHandler = new NullObjectLogInHandler()

const gitHubInstallationAccessTokenDataSource = new GitHubInstallationAccessTokenDataSource(gitHubAppCredentials)

export const authOptions: NextAuthOptions = {
  adapter: PostgresAdapter(pool) as Adapter,
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      authorization: {
        params: {
          scope: "repo"
        }
      }
    }),
    EmailProvider({
      sendVerificationRequest: ({ url }) => {
        console.log("Magic link", url) // print to console for now
      },
    }),
  ],
  session: {
    strategy: "database"
  },
  callbacks: {
    async signIn({ user, account, email }) {
      if (email && email.verificationRequest && user.email) { // in verification request flow
        const guest = await guestRepository.findByEmail(user.email)
        if (guest == undefined) {
          return false // email not invited
        }
      }
      else if (account?.provider == "email" && user.email) { // in sign in flow, click on magic link
        // obtain access token from GitHub using app auth
        const guest = await guestRepository.findByEmail(user.email)
        if (guest == undefined) {
          return false // email not invited
        }
        const accessToken = await gitHubInstallationAccessTokenDataSource.getAccessToken(guest.projects || [])
        const query = `
            INSERT INTO access_tokens (
              provider,
              provider_account_id,
              access_token
            )
            VALUES ($1, $2, $3)
            ON CONFLICT (provider, provider_account_id)
            DO UPDATE SET access_token = $3, last_updated_at = NOW();
            `
        await pool.query(query, [
          account.provider,
          account.providerAccountId,
          accessToken,
        ])
        return true
      }

      if (account) {
        return await logInHandler.handleLogIn(user.id, account)
      } else {
        return await logInHandler.handleLogIn(user.id)
      }
    },
    async session({ session, user }) {
      session.user.id = user.id
      return session
    }
  }
}

export const session: ISession = new AuthjsSession({ authOptions })

const accessTokenReader = new TransferringAccessTokenReader({
  userIdReader: session,
  sourceOAuthTokenRepository: new AuthjsOAuthTokenRepository({ provider: "github", db }),
  destinationOAuthTokenRepository: new OAuthTokenRepository({ provider: "github", db })
})

export const repositoryAccessReader = new AuthjsRepositoryAccessReader()

export const gitHubClient = new GitHubClient({
  ...gitHubAppCredentials,
  accessTokenReader
})

export const userGitHubClient = new AccessTokenRefreshingGitHubClient({
  gitHubClient,
  accessTokenReader,
  accessTokenRefresher: new LockingAccessTokenRefresher({
    mutexFactory: new SessionMutexFactory(
      new RedisKeyedMutexFactory(REDIS_URL),
      session,
      "mutexAccessToken"
    ),
    accessTokenRefresher: new AccessTokenRefresher({
      userIdReader: session,
      oAuthTokenRepository: new OAuthTokenRepository({ db, provider: "github" }),
      oAuthTokenRefresher: new GitHubOAuthTokenRefresher({
        clientId: gitHubAppCredentials.clientId,
        clientSecret: gitHubAppCredentials.clientSecret
      })
    })
  })
})

export const blockingSessionValidator = new AccessTokenSessionValidator({
  accessTokenReader
})
export const delayedSessionValidator = new GitHubOrganizationSessionValidator({
  acceptedOrganization: GITHUB_ORGANIZATION_NAME,
  organizationMembershipStatusReader: userGitHubClient,
  accountProviderTypeReader: session
})

const projectUserDataRepository = new KeyValueUserDataRepository(
  new RedisKeyValueStore(REDIS_URL),
  "projects"
)

export const projectRepository = new ProjectRepository(
  session,
  projectUserDataRepository
)

export const projectDataSource = new CachingProjectDataSource({
  dataSource: new GitHubProjectDataSource({
    graphQlClient: userGitHubClient,
    organizationName: GITHUB_ORGANIZATION_NAME
  }),
  repository: projectRepository
})

export const logOutHandler = new ErrorIgnoringLogOutHandler(
  new CompositeLogOutHandler([
    new UserDataCleanUpLogOutHandler(session, projectUserDataRepository)
  ])
)

export const guestRepository: IGuestRepository = new DbGuestRepository(pool)

const transport = createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "0682027d57d0db",
    pass: "28c3dbfbfc0af8"
  }
});

export const guestInviter: IGuestInviter = {
  inviteGuestByEmail: function (email: string): Promise<void> {
    transport.sendMail({
      to: email,
      from: "no-reply@docs.shapetools.io",
      subject: "You have been invited to join Shape Docs",
      html: `
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
            }
          </style>
        </head>
          <body>
            <p>You have been invited to join Shape Docs!</p>
            <p>Shape Docs uses magic links for authentication. This means that you don't need to remember a password.</p>
            <p>Click the link below to request your first magic link to log in:</p>
            <a href="https://docs.shapetools.io">Log in</a>
          </body>
        </html>
      `,
    })
    return Promise.resolve()
  }
}
