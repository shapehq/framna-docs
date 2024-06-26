import { createTransport } from "nodemailer"
import type { Transport, TransportOptions } from "nodemailer"
import * as JSONTransport from "nodemailer/lib/json-transport/index.js"
import * as SendmailTransport from "nodemailer/lib/sendmail-transport/index.js"
import * as SESTransport from "nodemailer/lib/ses-transport/index.js"
import * as SMTPTransport from "nodemailer/lib/smtp-transport/index.js"
import * as SMTPPool from "nodemailer/lib/smtp-pool/index.js"
import * as StreamTransport from "nodemailer/lib/stream-transport/index.js"

type AllTransportOptions =
  | string
  | SMTPTransport
  | SMTPTransport.Options
  | SMTPPool
  | SMTPPool.Options
  | SendmailTransport
  | SendmailTransport.Options
  | StreamTransport
  | StreamTransport.Options
  | JSONTransport
  | JSONTransport.Options
  | SESTransport
  | SESTransport.Options
  | Transport<any>
  | TransportOptions

export default class MagicLinkEmailSender {
  constructor() {}

  async sendMagicLink(params: {
    identifier: string
    expires: Date
    url: string
    provider: {
      from: string
      server?: AllTransportOptions
    }
  }): Promise<void> {
    const { identifier, expires, url, provider } = params
    const transport = createTransport(provider.server)
    const result = await transport.sendMail({
      to: identifier,
      from: provider.from,
      subject: "Sign in to Shape Docs",
      text: text({ url }),
      html: html({ url, expires }),
    })
    const failed = result.rejected.concat(result.pending).filter(Boolean)
    if (failed.length) {
      throw new Error(`Email (${failed.join(", ")}) could not be sent`)
    }
  }
}

function text({ url }: { url: string }) {
  return `Sign in to Shape Docs.\n${url}\n\n`
}

function html({ url, expires }: { url: string, expires: Date }) {
  const imageHost = "http://docs.shapetools.io"
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
        <img src="${imageHost}/images/duck.png" width="150" alt="Shape Docs logo" />
      </td>
    </tr>
    <tr>
      <td align="center"
        style="padding: 10px 0px; font-size: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
        Sign in to <strong>Shape Docs</strong>
      </td>
    </tr>
    <tr>
      <td align="center"
        style="padding: 0px 0px; font-size: 16px; font-family: Helvetica, Arial, sans-serif; color: ${color.text}; line-height: 24px;">
        The link can only be used once<br />and expires on <strong>${formatDate(expires)}</strong>.
      </td>
    </tr>
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td align="center" style="border-radius: 12px;" bgcolor="${color.buttonBackground}"><a href="${url}"
                target="_blank"
                style="font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${color.buttonText}; text-decoration: none; padding: 20px 30px; display: inline-block; font-weight: semibold;">Sign
                in</a></td>
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

function formatDate(date: Date) {
  const day = date.getDate()
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]
  const month = monthNames[date.getMonth()]
  const year = date.getFullYear()
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${month} ${day}, ${year}, at ${hours}:${minutes}`
}
