namespace NodeJS {
  interface ProcessEnv {
    readonly SHAPE_DOCS_BASE_URL: string
    readonly SHAPE_DOCS_PROJECT_CONFIGURATION_FILENAME: string
    readonly FROM_EMAIL: string | undefined
    readonly NEXT_PUBLIC_SHAPE_DOCS_TITLE: string
    readonly NEXT_PUBLIC_SHAPE_DOCS_DESCRIPTION: string
    readonly NEXTAUTH_URL_INTERNAL: string
    readonly NEXTAUTH_SECRET: string
    readonly REDIS_URL: string
    readonly POSTGRESQL_HOST: string
    readonly POSTGRESQL_USER: string
    readonly POSTGRESQL_DB: string
    readonly SMTP_HOST: string
    readonly SMTP_USER: string
    readonly SMTP_PASS: string
    readonly GITHUB_WEBHOOK_SECRET: string
    readonly GITHUB_WEBHOK_REPOSITORY_ALLOWLIST: string
    readonly GITHUB_WEBHOK_REPOSITORY_DISALLOWLIST: string
    readonly GITHUB_CLIENT_ID: string
    readonly GITHUB_CLIENT_SECRET: string
    readonly GITHUB_APP_ID: string
    readonly GITHUB_PRIVATE_KEY_BASE_64: string
  }
}
