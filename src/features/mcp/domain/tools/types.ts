import { z } from "zod"

export const ListProjectsArgsSchema = z.object({})

export const ListEndpointsArgsSchema = z.object({
  projectName: z.string().min(1),
  version: z.string().optional(),
  specName: z.string().optional(),
})

export const GetEndpointDetailsArgsSchema = z.object({
  projectName: z.string().min(1),
  path: z.string().min(1),
  method: z.string().min(1),
  version: z.string().optional(),
  specName: z.string().optional(),
})

export const ListSchemasArgsSchema = z.object({
  projectName: z.string().min(1),
  version: z.string().optional(),
  specName: z.string().optional(),
})

export const GetSchemaArgsSchema = z.object({
  projectName: z.string().min(1),
  schemaName: z.string().min(1),
  version: z.string().optional(),
  specName: z.string().optional(),
})

export const SearchEndpointsArgsSchema = z.object({
  projectName: z.string().min(1),
  query: z.string().min(1),
  version: z.string().optional(),
  specName: z.string().optional(),
})

export type ListProjectsArgs = z.infer<typeof ListProjectsArgsSchema>
export type ListEndpointsArgs = z.infer<typeof ListEndpointsArgsSchema>
export type GetEndpointDetailsArgs = z.infer<typeof GetEndpointDetailsArgsSchema>
export type ListSchemasArgs = z.infer<typeof ListSchemasArgsSchema>
export type GetSchemaArgs = z.infer<typeof GetSchemaArgsSchema>
export type SearchEndpointsArgs = z.infer<typeof SearchEndpointsArgsSchema>
