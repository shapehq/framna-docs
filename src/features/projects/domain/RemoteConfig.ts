import { z } from 'zod'
import { RemoteSpecAuthSchema } from './RemoteSpecAuth'

export const RemoteConfigSchema = z.object({
    url: z.string().url(),
    auth: RemoteSpecAuthSchema.optional(),
})

type RemoteConfig = z.infer<typeof RemoteConfigSchema>

export default RemoteConfig
