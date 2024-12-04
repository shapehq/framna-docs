import { publicEncrypt, privateDecrypt, constants } from 'crypto';

export interface IEncryptionService {
    encrypt(data: string): string;
    decrypt(encryptedDataBase64: string): string;
}

class RsaEncryptionService implements IEncryptionService {
    private publicKey: string;
    private privateKey: string;

    constructor({ publicKey, privateKey }: { publicKey: string; privateKey: string }) {
        this.publicKey = publicKey;
        this.privateKey = privateKey;
    }

    encrypt(data: string): string {
        const buffer = Buffer.from(data, 'utf-8');
        const encrypted = publicEncrypt(
            {
                key: this.publicKey,
                padding: constants.RSA_PKCS1_OAEP_PADDING,
                oaepHash: 'sha256'
            },
            buffer
        );
        return encrypted.toString('base64');
    }

    decrypt(encryptedDataBase64: string): string {
        return privateDecrypt(
              {
                key: this.privateKey,
                padding: constants.RSA_PKCS1_OAEP_PADDING,
                oaepHash: 'sha256'
              },
              Buffer.from(encryptedDataBase64, 'base64')
            ).toString('utf-8')
    }
}

export default RsaEncryptionService;
