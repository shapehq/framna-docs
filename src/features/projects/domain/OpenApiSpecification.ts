import { z } from "zod"

export const OpenApiSpecificationSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string(),
  urlHash: z.string().optional(),
  editURL: z.string().optional(),
  isDefault: z.boolean()
})

type OpenApiSpecification = z.infer<typeof OpenApiSpecificationSchema>

export default OpenApiSpecification
