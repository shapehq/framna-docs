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
  AuthjsOAuthTokenDataSource,
  GitHubInstallationAccessTokenDataSource
} from "@/features/auth/data"
import {
  AccessTokenDataSource,
  AccessTokenRefresher,
  AccessTokenTransferrer,
  AccessTokenSessionValidator,
  CompositeLogOutHandler,
  ErrorIgnoringLogOutHandler,
  GitHubOrganizationSessionValidator,
  GitHubAccessTokenTransferrer,
  GuestRepositoryAccessDataSource,
  GuestAccessTokenTransferrer,
  LockingAccessTokenRefresher,
  NullObjectLogInHandler,
  OAuthTokenRepository,
  UserDataCleanUpLogOutHandler
} from "@/features/auth/domain"
import { DbGuestRepository } from "./features/admin/data"
import { IGuestInviter, IGuestRepository } from "./features/admin/domain"
import { createTransport } from "nodemailer"

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

export const session: ISession = new AuthjsSession({ db, authOptions })

export const guestRepository: IGuestRepository = new DbGuestRepository(pool)

const oauthTokenRepository = new OAuthTokenRepository({ db, provider: "github" })

const githubAccessTokenDataSource = new AccessTokenDataSource({
  session,
  oauthTokenDataSource: oauthTokenRepository,
  accessTokenTransferrer: new AccessTokenTransferrer({
    session,
    gitHubAccessTokenTransferrer: new GitHubAccessTokenTransferrer({
      session,
      sourceOAuthTokenDataSource: new AuthjsOAuthTokenDataSource({ db, provider: "github" }),
      destinationOAuthTokenRepository: oauthTokenRepository
    }),
    guestAccessTokenTransferrer: new GuestAccessTokenTransferrer({
      session,
      guestRepository,
      installationAccessTokenDataSource: new GitHubInstallationAccessTokenDataSource(
        gitHubAppCredentials
      ),
      destinationOAuthTokenRepository: oauthTokenRepository
    })
  }),
  mutexFactory: new SessionMutexFactory({
    baseKey: "mutexTransferAccessToken",
    mutexFactory: new RedisKeyedMutexFactory(REDIS_URL),
    userIdReader: session
  })
})

export const repositoryAccessReader = new GuestRepositoryAccessDataSource({
  db,
  guestRepository
})

export const gitHubClient = new GitHubClient({
  ...gitHubAppCredentials,
  accessTokenDataSource: githubAccessTokenDataSource
})

export const userGitHubClient = new AccessTokenRefreshingGitHubClient({
  gitHubClient,
  accessTokenDataSource: githubAccessTokenDataSource,
  accessTokenRefresher: new LockingAccessTokenRefresher({
    mutexFactory: new SessionMutexFactory({
      baseKey: "mutexAccessToken",
      mutexFactory: new RedisKeyedMutexFactory(REDIS_URL),
      userIdReader: session
    }),
    accessTokenRefresher: new AccessTokenRefresher({
      userIdReader: session,
      oAuthTokenRepository: oauthTokenRepository,
      oAuthTokenRefresher: new GitHubOAuthTokenRefresher({
        clientId: gitHubAppCredentials.clientId,
        clientSecret: gitHubAppCredentials.clientSecret
      })
    })
  })
})

export const blockingSessionValidator = new AccessTokenSessionValidator({
  accessTokenDataSource: githubAccessTokenDataSource
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
