import { Pool } from "pg"
import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"
import EmailProvider from "next-auth/providers/nodemailer"
import PostgresAdapter from "@auth/pg-adapter"
import RedisKeyedMutexFactory from "@/common/mutex/RedisKeyedMutexFactory"
import RedisKeyValueStore from "@/common/key-value-store/RedisKeyValueStore"
import {
  AuthjsSession,
  GitHubClient,
  ISession,
  KeyValueUserDataRepository,
  OAuthTokenRefreshingGitHubClient,
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
  GitHubInstallationAccessTokenDataSource
} from "@/features/auth/data"
import {
  AccountProviderTypeBasedOAuthTokenRefresher,
  AuthjsAccountsOAuthTokenRepository,
  CompositeLogOutHandler,
  CompositeOAuthTokenRepository,
  ErrorIgnoringLogOutHandler,
  GitHubOrganizationSessionValidator,
  GuestOAuthTokenDataSource,
  GuestOAuthTokenRefresher,
  LockingOAuthTokenRefresher,
  LogInHandler,
  PersistingOAuthTokenDataSource,
  PersistingOAuthTokenRefresher,
  OAuthTokenRepository,
  OAuthTokenSessionValidator,
  UserDataCleanUpLogOutHandler
} from "@/features/auth/domain"
import {
  DbGuestRepository,
  DbUserRepository,
  EmailGuestInviter,
  MagicLinkEmailSender
} from "./features/admin/data"
import {
  IGuestInviter,
  IGuestRepository,
  IUserRepository
} from "./features/admin/domain"

const {
  GITHUB_APP_ID,
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  GITHUB_PRIVATE_KEY_BASE_64,
  GITHUB_ORGANIZATION_NAME,
  REDIS_URL,
  POSTGRESQL_HOST,
  POSTGRESQL_USER,
  POSTGRESQL_DB,
  SMTP_HOST,
  SMTP_USER,
  SMTP_PASS,
  FROM_EMAIL,
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

const oauthTokenRepository = new CompositeOAuthTokenRepository({
  oAuthTokenRepositories: [
    new OAuthTokenRepository({ db, provider: "github" }),
    new AuthjsAccountsOAuthTokenRepository({ db, provider: "github" })
  ]
})

const userRepository: IUserRepository = new DbUserRepository({ db })

export const guestRepository: IGuestRepository = new DbGuestRepository({ db })

const logInHandler = new LogInHandler({ userRepository, guestRepository })

// Must be a verified email in AWS SES.
const fromEmail = FROM_EMAIL || "Shape Docs <no-reply@docs.shapetools.io>"

export const auth = NextAuth({
  adapter: PostgresAdapter(pool),
  secret: process.env.NEXTAUTH_SECRET,
  theme: {
    logo: "/images/duck.png",
    colorScheme: "light",
    brandColor: "black"
  },
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
      server: {
        host: SMTP_HOST,
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS,
        }
      },
      from: fromEmail,
      name: "email",
      sendVerificationRequest: async (params) => {
        const sender = new MagicLinkEmailSender()
        await sender.sendMagicLink(params)
      }
    }),
  ],
  session: {
    strategy: "database"
  },
  callbacks: {
    async signIn({ user, account, email }) {
      return await logInHandler.handleLogIn(user, account, email)
    },
    async session({ session, user }) {
      session.user.id = user.id
      return session
    }
  }
})

export const session: ISession = new AuthjsSession({ db, auth })

const guestOAuthTokenDataSource = new GuestOAuthTokenDataSource({
  session,
  guestRepository,
  gitHubInstallationAccessTokenDataSource: new GitHubInstallationAccessTokenDataSource(
    gitHubAppCredentials
  )
})

const oauthTokenDataSource = new PersistingOAuthTokenDataSource({
  session,
  mutexFactory: new SessionMutexFactory({
    baseKey: "mutexPersistingOAuthTokenDataSource",
    mutexFactory: new RedisKeyedMutexFactory(REDIS_URL),
    userIdReader: session
  }),
  repository: oauthTokenRepository,
  dataSource: guestOAuthTokenDataSource
})

const oauthTokenRefresher = new LockingOAuthTokenRefresher({
  mutexFactory: new SessionMutexFactory({
    baseKey: "mutexLockingOAuthTokenRefresher",
    mutexFactory: new RedisKeyedMutexFactory(REDIS_URL),
    userIdReader: session
  }),
  oauthTokenRefresher: new PersistingOAuthTokenRefresher({
    userIdReader: session,
    oauthTokenRepository,
    oauthTokenRefresher: new AccountProviderTypeBasedOAuthTokenRefresher({
      accountProviderReader: session,
      strategy: {
        github: new GitHubOAuthTokenRefresher(gitHubAppCredentials),
        email: new GuestOAuthTokenRefresher({
          dataSource: guestOAuthTokenDataSource
        })
      }
    })
  })
})

export const gitHubClient = new GitHubClient({
  ...gitHubAppCredentials,
  oauthTokenDataSource
})

export const userGitHubClient = new OAuthTokenRefreshingGitHubClient({
  gitHubClient,
  oauthTokenDataSource,
  oauthTokenRefresher,
})

export const blockingSessionValidator = new OAuthTokenSessionValidator({
  oauthTokenDataSource
})

export const delayedSessionValidator = new GitHubOrganizationSessionValidator({
  acceptedOrganization: GITHUB_ORGANIZATION_NAME,
  organizationMembershipStatusReader: userGitHubClient,
  accountProviderReader: session
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

export const guestInviter: IGuestInviter = new EmailGuestInviter({
  server: {
    host: SMTP_HOST,
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
  from: fromEmail
})
