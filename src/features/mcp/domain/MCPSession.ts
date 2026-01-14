import { z } from "zod"

export const MCPSessionSchema = z.object({
  sessionId: z.string().uuid(),
  accessToken: z.string(),
  refreshToken: z.string().optional(),
  expiresAt: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
})

export type MCPSession = z.infer<typeof MCPSessionSchema>
