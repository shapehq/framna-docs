namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_SHAPE_DOCS_TITLE: string
    SHAPE_DOCS_BASE_URL: string
    NEXTAUTH_URL: string
    NEXTAUTH_SECRET: string
    GITHUB_CLIENT_ID: string
    GITHUB_CLIENT_SECRET: string
    GITHUB_APP_ID: string
    GITHUB_PRIVATE_KEY_BASE_64: string
    GITHUB_WEBHOOK_SECRET: string
    GITHUB_WEBHOK_REPOSITORY_ALLOWLIST?: string
    GITHUB_WEBHOK_REPOSITORY_DISALLOWLIST?: string
    GITHUB_ORGANIZATION_NAME: string
    REDIS_URL: string
    DATABASE_URL: string
  }
}
