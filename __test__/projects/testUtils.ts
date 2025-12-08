import RemoteConfig from "@/features/projects/domain/RemoteConfig"

/**
 * Simple encryption service for testing. Does nothing.
 */
export const noopEncryptionService = {
  encrypt: function (data: string): string {
    return data
  },
  decrypt: function (encryptedDataBase64: string): string {
    return encryptedDataBase64
  }
}

/**
 * Simple encoder for testing
 */
export const base64RemoteConfigEncoder = {
  encode: function (remoteConfig: RemoteConfig): string {
    return Buffer.from(JSON.stringify(remoteConfig)).toString("base64")
  },
  decode: function (encodedString: string): RemoteConfig {
    return JSON.parse(Buffer.from(encodedString, "base64").toString())
  }
}
