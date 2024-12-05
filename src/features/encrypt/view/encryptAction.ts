'use server'

import { encryptionService } from '@/composition'

export async function encrypt(text: string): Promise<string> {
    return encryptionService.encrypt(text)
}
