namespace NodeJS {
  interface ProcessEnv {
    AUTH0_SECRET: string
    AUTH0_BASE_URL: string
    AUTH0_ISSUER_BASE_URL: string
    AUTH0_CLIENT_ID: string
    AUTH0_CLIENT_SECRET: string
    AUTH0_MANAGEMENT_DOMAIN: string
    AUTH0_MANAGEMENT_CLIENT_ID: string
    AUTH0_MANAGEMENT_CLIENT_SECRET: string
    GITHUB_CLIENT_ID: string
    GITHUB_CLIENT_SECRET: string
    GITHUB_APP_ID: string
    GITHUB_PRIVATE_KEY_BASE_64: string
    GITHUB_WEBHOOK_SECRET: string
    DATABASE_URL: string
  }
}
