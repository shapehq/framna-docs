declare module "next-auth" {
  interface Session {
    readonly user: {
      readonly id: string
      readonly email: string
      readonly name?: string
      readonly image?: string
    }
  }
}
