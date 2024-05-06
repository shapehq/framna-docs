import { Transporter, createTransport } from "nodemailer";
import { IGuestInviter } from "../domain";

export default class EmailGuestInviter implements IGuestInviter {
    readonly transport: Transporter;
    readonly from: string;

    constructor(options: { server: {host: string, user: string, pass: string}, from: string }) {
        this.transport = createTransport({
            host: options.server.host,
            auth: {
                user: options.server.user,
                pass: options.server.pass,
            },
        });
        this.from = options.from;
    }

    async inviteGuestByEmail(email: string): Promise<void> {
        await this.transport.sendMail({
            to: email,
            from: this.from,
            subject: "You have been invited to join Shape Docs",
            html: `
            <html>
            <head>
              <style>
                body {
                  font-family: Arial, sans-serif;
                }
              </style>
            </head>
              <body>
                <p>You have been invited to join Shape Docs!</p>
                <p>Shape Docs uses magic links for authentication. This means that you don't need to remember a password.</p>
                <p>To get started click here: <a href="https://docs.shapetools.io">Sign in</a></p>
              </body>
            </html>
          `,
        });
    }
}
