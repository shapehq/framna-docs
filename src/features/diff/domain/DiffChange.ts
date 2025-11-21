import { z } from "zod"

export const DiffChangeSchema = z.object({
  id: z.string(),
  text: z.string(),
  level: z.number(),
  operation: z.string().optional(),
  operationId: z.string().optional(),
  path: z.string().optional(),
  source: z.string().optional(),
  section: z.string().optional(),
})

export type DiffChange = z.infer<typeof DiffChangeSchema>
