import { z } from "zod"

export const OAuthTokenSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  accessTokenExpiryDate: z.coerce.date(),
  refreshTokenExpiryDate: z.coerce.date()
})

type OAuthToken = z.infer<typeof OAuthTokenSchema>

export default OAuthToken
