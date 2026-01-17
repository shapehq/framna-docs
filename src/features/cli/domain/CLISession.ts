import { z } from "zod"

export const CLISessionSchema = z.object({
  sessionId: z.string().uuid(),
  accessToken: z.string(),
  refreshToken: z.string().optional(),
  expiresAt: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
})

export type CLISession = z.infer<typeof CLISessionSchema>
