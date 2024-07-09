import { Transporter, createTransport } from "nodemailer"
import { IGuestInviter } from "../domain"
import base64EncodedLogo from "@/common/images/base64EncodedLogo"

export default class EmailGuestInviter implements IGuestInviter {
  private readonly websiteTitle: string
  private readonly url: string
  private readonly transport: Transporter
  private readonly from: string

  constructor(config: {
    websiteTitle: string,
    url: string,
    server: {
      host: string,
      user: string,
      pass: string
    },
    from: string
  }) {
    this.websiteTitle = config.websiteTitle
    this.url = config.url
    this.transport = createTransport({
      host: config.server.host,
      auth: {
        user: config.server.user,
        pass: config.server.pass
      }
    })
    this.from = config.from
  }

  async inviteGuestByEmail(email: string): Promise<void> {
    await this.transport.sendMail({
      to: email,
      from: this.from,
      subject: `You have been invited ${this.websiteTitle}`,
      text: this.makeText(),
      html: this.makeHtml()
    })
  }
  
  private makeText() {
    return `You have been invited to ${this.websiteTitle}\n\nSign in with your e-mail on ${this.url}\n\n`
  }

  private makeHtml() {
    const displayURL = this.url.replace(/https?:\/\//gi, "")
    const color = {
      background: "#f9f9f9",
      text: "#000",
      mainBackground: "#fff",
      buttonBackground: "#0D6DDB",
      buttonText: "#fff"
    }
    return `
  <body style="background: ${color.background};">
    <table width="100%" border="0" cellspacing="20" cellpadding="0"
      style="background: ${color.mainBackground}; max-width: 600px; margin: auto; border-radius: 10px;">
      <tr>
        <td align="center" style="padding: 10px 0px;">
          <img src="data:image/jpg;base64,${base64EncodedLogo}" width="150" alt="${this.websiteTitle} logo" />
        </td>
      </tr>
      <tr>
        <td align="center"
          style="padding: 10px 0px; font-size: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
          You have been invited to <strong>${this.websiteTitle}</strong>
        </td>
      </tr>
      <tr>
        <td align="center"
          style="padding: 0px 0px; font-size: 16px; font-family: Helvetica, Arial, sans-serif; color: ${color.text}; line-height: 24px;">
          ${this.websiteTitle} uses magic links for signing in,<br />so you don't need to remember a password.<br />
        </td>
      </tr>
      <tr>
        <td align="center"
          style="padding: 0px 0px; font-size: 16px; font-family: Helvetica, Arial, sans-serif; color: ${color.text}; line-height: 24px;">
          Visit <a href="${this.url}">${displayURL}</a> and enter your email to sign in.
        </td>
      </tr>
      <tr>
        <td align="center" style="padding: 20px 0;">
          <table border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td align="center" style="border-radius: 12px;" bgcolor="${color.buttonBackground}"><a href="${this.url}"
                  target="_blank"
                  style="font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${color.buttonText}; text-decoration: none; padding: 20px 30px; display: inline-block; font-weight: semibold;">Go to ${this.websiteTitle}</a></td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td align="center"
          style="padding: 0px 0px 10px 0px; font-size: 16px; line-height: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
          If you did not request this email, you can safely ignore it.
        </td>
      </tr>
    </table>
  </body>
  `
  }
}
