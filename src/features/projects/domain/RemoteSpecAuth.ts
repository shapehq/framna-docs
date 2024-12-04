import { z } from 'zod'

export const RemoteSpecAuthSchema = z.object({
    type: z.string(),
    username: z.string(),
    password: z.string(),
})

type RemoteSpecAuth = z.infer<typeof RemoteSpecAuthSchema>

export default RemoteSpecAuth
