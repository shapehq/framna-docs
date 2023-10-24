import { z } from "zod"
import { OpenApiSpecificationSchema } from "./OpenApiSpecification"

export const VersionSchema = z.object({
  id: z.string(),
  name: z.string(),
  specifications: OpenApiSpecificationSchema.array(),
  url: z.string().optional()
})

type Version = z.infer<typeof VersionSchema>

export default Version
