import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private resend: Resend;
  private readonly logger = new Logger(MailService.name);

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    if (!apiKey) {
      this.logger.warn('RESEND_API_KEY is not defined. Email functionality will not work.');
    }
    // Pass a dummy key if undefined to prevent Resend constructor from throwing an error
    this.resend = new Resend(apiKey || 're_dummy_key_to_prevent_crash');
  }

  async sendMail(to: string, subject: string, html: string) {
    try {
      const apiKey = this.configService.get<string>('RESEND_API_KEY');
      if (!apiKey) {
        this.logger.warn(`Mocking email to ${to} since RESEND_API_KEY is not configured.`);
        return { success: true, data: { id: 'mock_email_id' } };
      }

      const from = this.configService.get<string>('RESEND_FROM_EMAIL') || this.configService.get<string>('EMAIL_FROM') || 'onboarding@resend.dev';

      const { data, error } = await this.resend.emails.send({
        from,
        to,
        subject,
        html,
      });

      if (error) {
        this.logger.error(`Failed to send email to ${to}: ${error.message}`);
        throw new InternalServerErrorException(`Failed to send email: ${error.message}`);
      }

      this.logger.log(`Email sent successfully to ${to}. ID: ${data?.id}`);
      return { success: true, data };
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      this.logger.error(`Error sending email to ${to}:`, error);
      throw new InternalServerErrorException('An unexpected error occurred while sending the email');
    }
  }

  async sendPasswordResetEmail(to: string, resetUrl: string) {
    const subject = 'Reset Your Password - NetzerTech';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #333; text-align: center;">NetzerTech Password Reset</h2>
        <p>Hello,</p>
        <p>You requested a password reset for your NetzerTech account. Click the button below to reset your password. This link will expire in 1 hour.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #216388; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
        </div>
        <p>If you did not request this, please ignore this email or contact support if you have concerns.</p>
        <p>Alternatively, you can copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #007bff;">${resetUrl}</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="font-size: 12px; color: #888; text-align: center;">&copy; ${new Date().getFullYear()} NetzerTech. All rights reserved.</p>
      </div>
    `;

    return this.sendMail(to, subject, html);
  }
}
