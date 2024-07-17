import { z } from "zod"

export const OAuthTokenSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string()
})

type OAuthToken = z.infer<typeof OAuthTokenSchema>

export default OAuthToken
