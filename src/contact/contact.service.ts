import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { MailService } from '../mail/mail.service';
import { ContactFormDto } from './dto/contact.dto';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);
  private readonly adminEmail = 'admin@netzertech.co';

  constructor(private readonly mailService: MailService) { }

  async submitContactForm(dto: ContactFormDto): Promise<{ message: string; success: boolean }> {
    try {
      const subject = `New Contact Inquiry from ${dto.firstName} ${dto.lastName}`;
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #333; text-align: center;">New Contact Request</h2>
          <p>You have received a new message from the NetzerTech public website.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <table style="width: 100%; text-align: left; border-collapse: collapse;">
            <tr>
              <th style="padding: 10px; border-bottom: 1px solid #eee; width: 30%;">Full Name</th>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${dto.firstName} ${dto.lastName}</td>
            </tr>
            <tr>
              <th style="padding: 10px; border-bottom: 1px solid #eee;">Email Address</th>
              <td style="padding: 10px; border-bottom: 1px solid #eee;"><a href="mailto:${dto.email}">${dto.email}</a></td>
            </tr>
            <tr>
              <th style="padding: 10px; border-bottom: 1px solid #eee;">Phone Number</th>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${dto.phoneNumber}</td>
            </tr>
          </table>
          <h3 style="margin-top: 20px;">Message:</h3>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; font-style: italic; white-space: pre-wrap;">
            ${dto.message}
          </div>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="font-size: 12px; color: #888; text-align: center;">&copy; ${new Date().getFullYear()} NetzerTech System</p>
        </div>
      `;

      // We send this to the admin email, with the reply-to header technically implied by the content
      await this.mailService.sendMail(this.adminEmail, subject, html);

      this.logger.log(`Processed contact form submission from ${dto.email}`);

      return {
        message: 'Your message has been sent successfully. We will get back to you shortly.',
        success: true,
      };
    } catch (error) {
      this.logger.error('Failed to process contact form', error);
      throw new InternalServerErrorException('Failed to send contact message at this time.');
    }
  }
}
