import { IEncryptionService } from "@/features/encrypt/EncryptionService";
import RemoteConfig, { RemoteConfigSchema } from "./RemoteConfig";

export interface IRemoteConfigEncoder {
    encode(remoteConfig: RemoteConfig): string;
    decode(encodedString: string): RemoteConfig;
}

/**
 * Encodes and decodes remote configs.
 * 
 * The remote config is first stringified to JSON, then encrypted, and finally encoded in base64.
 * 
 * At the receiving end, the encoded string is first decoded from base64, then decrypted, and finally parsed as JSON.
 */
export default class RemoteConfigEncoder implements IRemoteConfigEncoder {
    private readonly encryptionService: IEncryptionService;

    constructor(encryptionService: IEncryptionService) {
        this.encryptionService = encryptionService;
    }

    encode(remoteConfig: RemoteConfig): string {
        const jsonString = JSON.stringify(remoteConfig);
        const encryptedString = this.encryptionService.encrypt(jsonString);
        return Buffer.from(encryptedString).toString('base64');
    }

    decode(encodedString: string): RemoteConfig {
        const decodedString = Buffer.from(encodedString, 'base64').toString('utf-8');
        const decryptedString = this.encryptionService.decrypt(decodedString);
        return RemoteConfigSchema.parse(JSON.parse(decryptedString));
    }
}
