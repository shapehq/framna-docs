import nodemailer from 'nodemailer';
import { EmailGuestInviter } from "@/features/admin/data/EmailGuestInviter"

jest.mock('nodemailer', () => {
    return {
        createTransport: jest.fn().mockReturnValue({
            sendMail: jest.fn(),
        }),
    }
})

describe('EmailGuestInviter', () => {
    describe('constructor', () => {
        it('should create a transporter', () => {
            const sut = new EmailGuestInviter({
                server: {
                    host: 'smtp.example.com',
                    user: 'user',
                    pass: 'pass',
                },
                from: 'some@email.dk',
            })

            expect(nodemailer.createTransport).toHaveBeenCalledWith({
                host: 'smtp.example.com',
                auth: {
                    user: 'user',
                    pass: 'pass',
                },
            })
        })
    })

    describe('inviteGuestByEmail', () => {
        it('should send an invite', async () => {
            const sut = new EmailGuestInviter({
                server: {
                    host: 'smtp.example.com',
                    user: 'user',
                    pass: 'pass',
                },
                from: 'some@email.dk',
            })
    
            sut.inviteGuestByEmail('guest@email.dk')
    
            expect(nodemailer.createTransport().sendMail).toHaveBeenCalledWith({
                to: 'guest@email.dk',
                from: 'some@email.dk',
                subject: 'You have been invited to join Shape Docs',
                html: expect.any(String), // difficult to test the exact content
            });
        })
    })
})
