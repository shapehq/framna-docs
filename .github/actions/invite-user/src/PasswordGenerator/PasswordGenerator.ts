import IPasswordGenerator from "./IPasswordGenerator"

export default class PasswordGenerator implements IPasswordGenerator {
  generatePassword(): string {
    let pass = ""
    const str = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$"
    const length = 18
    for (let i = 1; i <= length; i++) {
      const char = Math.floor(Math.random() * str.length + 1)
      pass += str.charAt(char)
    }
    return pass
  }
}
