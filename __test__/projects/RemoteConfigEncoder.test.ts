import RemoteConfigEncoder from "@/features/projects/domain/RemoteConfigEncoder"
import { IEncryptionService } from "@/features/encrypt/EncryptionService"
import RemoteConfig from "@/features/projects/domain/RemoteConfig"
import { ZodError } from "zod"

describe('RemoteConfigEncoder', () => {
    const encryptionService: IEncryptionService = {
        encrypt: (data: string) => `encrypted-${data}`,
        decrypt: (data: string) => data.replace('encrypted-', '')
    }

    const encoder = new RemoteConfigEncoder(encryptionService)

    it('should encode a remote config by first encrypting and then encoding with base64', () => {
        const remoteConfig: RemoteConfig = { url: 'https://example.com/spec.yaml' }
        const encoded = encoder.encode(remoteConfig)
        const expectedEncoded = Buffer.from('encrypted-{"url":"https://example.com/spec.yaml"}').toString('base64')
        expect(encoded).toEqual(expectedEncoded)
    })

    it('should decode an encoded string', () => {
        const encodedString = Buffer.from('encrypted-{"url":"https://example.com/spec.yaml"}').toString('base64')
        const decoded = encoder.decode(encodedString)
        const expectedDecoded: RemoteConfig = { url: 'https://example.com/spec.yaml' }
        expect(decoded).toEqual(expectedDecoded)
    })

    it('should throw an error if the decrypted string is not valid JSON', () => {
        const invalidJson = Buffer.from('encrypted-invalid-json').toString('base64')
        expect(() => encoder.decode(invalidJson)).toThrow("Unexpected token i in JSON at position 0")
    })

    it('should throw an error if the remote config is not valid', () => {
        const remoteConfig: RemoteConfig = { url: '' }
        const encoded = encoder.encode(remoteConfig)
        expect(() => encoder.decode(encoded)).toThrow(ZodError)
    })
})
