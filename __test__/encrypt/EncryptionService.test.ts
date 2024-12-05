import RsaEncryptionService from '../../src/features/encrypt/EncryptionService'
import { generateKeyPairSync } from 'crypto'

describe('RsaEncryptionService', () => {
    const { publicKey, privateKey } = generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem'
        }
    })

    const encryptionService = new RsaEncryptionService({ publicKey, privateKey })

    it('should encrypt and decrypt data correctly', () => {
        const data = 'Hello, World!'
        const encryptedData = encryptionService.encrypt(data)
        const decryptedData = encryptionService.decrypt(encryptedData)

        expect(decryptedData).toBe(data)
    })

    it('should throw an error when decrypting with incorrect data', () => {
        const incorrectData = 'invalidEncryptedData'

        expect(() => {
            encryptionService.decrypt(incorrectData)
        }).toThrow()
    })

    it('should throw an error when encrypting with an invalid public key', () => {
        const invalidPublicKey = 'invalidPublicKey'
        const invalidEncryptionService = new RsaEncryptionService({ publicKey: invalidPublicKey, privateKey })

        expect(() => {
            invalidEncryptionService.encrypt('test')
        }).toThrow()
    })

    it('should throw an error when decrypting with an invalid private key', () => {
        const data = 'Hello, World!'
        const encryptedData = encryptionService.encrypt(data)
        const invalidPrivateKey = 'invalidPrivateKey'
        const invalidEncryptionService = new RsaEncryptionService({ publicKey, privateKey: invalidPrivateKey })

        expect(() => {
            invalidEncryptionService.decrypt(encryptedData)
        }).toThrow()
    })
})
