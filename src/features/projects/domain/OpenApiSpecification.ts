import { z } from "zod"

export const OpenApiSpecificationSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string(),
  editURL: z.string().optional()
})

type OpenApiSpecification = z.infer<typeof OpenApiSpecificationSchema>

export default OpenApiSpecification
