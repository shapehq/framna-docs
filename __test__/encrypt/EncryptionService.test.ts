import RsaEncryptionService from '../../src/features/encrypt/EncryptionService'

const publicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAu1k4JT719AUz/wuXb2rt
8933okfM2Iynmc6akSsZWEsW19byzO0UHp8b79xvsmNQKM1wBEBnXb5t+uLjJJZe
rqCiTB7fBL64tExSKIDIRAlMnQtMfHs/rMgR+o/N2Yo2KimQw9G84goCEbBF2kbw
5/MQfe43HeEoVWbNfgmRyP8VudO1UtVr07dGoUEWvFjudtd/h5H9THVdEpp2vH2Z
pSGypn8hRAbOzhIM4ExLOH4ZHb8gPQGiHRGUYXk3Cy95RSf/SpEnRi0p4/63Nx5M
JNXGM2Jk0RgGcYZcwJvLanT5Xdb9LM/IsDxLKXN+utDUgkzddvJbBC12aLaKaJA5
LwIDAQAB
-----END PUBLIC KEY-----`

const privateKey = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7WTglPvX0BTP/
C5dvau3z3feiR8zYjKeZzpqRKxlYSxbX1vLM7RQenxvv3G+yY1AozXAEQGddvm36
4uMkll6uoKJMHt8Evri0TFIogMhECUydC0x8ez+syBH6j83ZijYqKZDD0bziCgIR
sEXaRvDn8xB97jcd4ShVZs1+CZHI/xW507VS1WvTt0ahQRa8WO5213+Hkf1MdV0S
mna8fZmlIbKmfyFEBs7OEgzgTEs4fhkdvyA9AaIdEZRheTcLL3lFJ/9KkSdGLSnj
/rc3Hkwk1cYzYmTRGAZxhlzAm8tqdPld1v0sz8iwPEspc3660NSCTN128lsELXZo
topokDkvAgMBAAECggEAAWQMl0laQ8OZfiqWY72Ry0oYPgFvFO1PpkQHObm3+S+d
8Q81IgXNLNtWKSA4VpXYQ4zcJUpADmg1ZdxAfszUB4kcshHdpz4Z9Y849i6KW4l4
qZsP3hbQWtTbgYWG71+M+y2sqJu0hgCkLPmm31AsJDG6zPtEKokKbYH7jWV0Xo5z
0g6IUqepc1ElNzsJAU10hgX5UZUPxvzbWHxhBhFzC51GKpfx/W5ZOQtB+W8+nlmC
OSVlZ9pfr6qxOZbSLWESU1xplywPTPLoYs/38oN5OHIJvB2j8kl+JfcR7v2ezLeV
fx1Z+x9ME0at7AbGCfhjIfJtftPsoCR60nzN3wWoAQKBgQDfOmfzLaWhVkvt49Hn
zeLdLI8pwqWXVYozsPMRlExwuIT1KeNolPzWWKx6dG38UzY4XWSvq+w3WAcQ7m6E
qiRWoRPL3qlWu3pDJYr/EfR2haPMQMwbJM/hg+nC0bhUSVqBEjOZgaQUHStIyugb
SWQFI3jE9fgj71DtbiVNrb1vAQKBgQDW2ljkotAjF81vI+EoN9QmuPYnejo42nK9
jlSEU4hrDQMLiqxc5yJidQh75vZRfaO9rdUqHxoXK0DEU3Jk16Kb0n4nkM+xqKoc
yHTtAgUyflpenbrr4pRZf783XgI0bn/FhoMFQtAvSblru3NfEFQUtKIY82+Xa5H5
g+cezSDYLwKBgBeViB39GJ6vC16azzZ6XhmX95gl5HDUrMFBVKzqyhiupf1w64HF
G+FZhP97BZO/Bt91nomg1FgUiMqVJkAF6cjtQ7YqVCHBtO0bLlA8iWNsQx31Spsj
jIL6+NuIZL0i8tjoH2N8euVVH5mVNmiLnHGeicflZM4HHrm3BWHrlTQBAoGBALeW
W98CQFe8Pw542ixDiESOR8fz6UwrXWAb/pwTxL20oKV8GUxJNFhtKJK3CEMZ2JB7
uWoEqYairvUTWOxSVeBQPPwSAWcNeE6f+0mKMGa1EQNIRDDLq3fOcNYevkOPKB7g
kZQtQzclCAvGYQ8aJL6MmvY3DWOVx2YuD4+COE6BAoGAEGdChfJW5QGXaXEO/PnA
PbQCCzcqbs+0O6LVR1w68H0WQww94tZjfWPqn9kvwjzLd22ZMmdiBJ3bEbDeCjmG
Ybt48kS7y9n22CDgL7JkatszYpybvBSrDQL7ms7x2kKPkTMb7C5zpIIzdtvwH+Jf
6K3kQbqfFCM7VmyR7AmoyOk=
-----END PRIVATE KEY-----`

const encryptionService = new RsaEncryptionService({ publicKey, privateKey })

describe('RsaEncryptionService', () => {
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
