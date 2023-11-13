import { z } from "zod"
import { VersionSchema } from "./Version"

export const ProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  displayName: z.string(),
  versions: VersionSchema.array(),
  imageURL: z.string().optional(),
  url: z.string().optional()
})

type Project = z.infer<typeof ProjectSchema>

export default Project
