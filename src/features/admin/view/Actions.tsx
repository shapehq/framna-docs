'use server'

import { guestInviter, guestRepository } from "@/composition"
import { revalidatePath } from "next/cache"
import { z } from 'zod'

const sendInviteSchema = z.object({
    email: z.string().email(),
    projects: z.string().min(1).transform(v => v.trim().split(","))
})

export interface SendInviteResult {
    error?: string,
    success: boolean,
}

/**
* Server action to send an invite
*/
export const sendInvite = async (prevState: any, formData: FormData): Promise<SendInviteResult> => {
    const validatedFields = sendInviteSchema.safeParse({
        email: formData.get('email'),
        projects: formData.get('projects'),
    })

    if (!validatedFields.success) {
        return {
            error: validatedFields.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', '),
            success: false,
        }
    }

    try {
        await guestRepository.create(validatedFields.data.email, validatedFields.data.projects)
        await guestInviter.inviteGuestByEmail(validatedFields.data.email)

        revalidatePath('/admin/guests')

        return {
            success: true,
        }
    } catch (error: unknown) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'An error occurred',
        }
    }
}

/**
 * Server action to remove a guest
 */
export const removeGuest = async (formData: FormData): Promise<void> => {
    'use server'

    const email = formData.get('email') as string

    await guestRepository.removeByEmail(email)

    revalidatePath('/admin/guests')
}
