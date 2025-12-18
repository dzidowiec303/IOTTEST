import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  secure: false,
  auth: {
    user: 'amelia.tremblay23@ethereal.email',
    pass: 'A8eA3ktBHj1W9gVpwN',
  },
});

class EmailService {
  async sendResetPasswordEmail(to: string, newPassword: string): Promise<void> {
    try {
      const info = await transporter.sendMail({
        from: '"Twoja Aplikacja" <no-reply@twojadomena.com>',
        to,
        subject: 'Resetowanie hasła',
        text: `Twoje nowe hasło to: ${newPassword}`,
        html: `<p>Twoje nowe hasło to: <strong>${newPassword}</strong></p>`,
      });

      console.log('Message sent: %s', info.messageId);
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    } catch (error) {
      console.error('Błąd podczas wysyłania maila:', error);
    }
  }
}

export const emailService = new EmailService();
export { EmailService }; 
