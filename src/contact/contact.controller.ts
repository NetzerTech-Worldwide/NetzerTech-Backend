import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { ContactService } from './contact.service';
import { ContactFormDto } from './dto/contact.dto';

@ApiTags('Public - Contact')
@Controller('contact')
export class ContactController {
    constructor(private readonly contactService: ContactService) { }

    @Post('submit')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Submit a contact form from the public website' })
    @ApiBody({ type: ContactFormDto })
    @ApiResponse({
        status: 200,
        description: 'Contact form submitted successfully.',
        schema: {
            properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: 'Your message has been sent successfully. We will get back to you shortly.' }
            }
        }
    })
    @ApiResponse({ status: 400, description: 'Bad Request - Validation failed.' })
    @ApiResponse({ status: 500, description: 'Internal Server Error' })
    async submitContactForm(@Body() dto: ContactFormDto) {
        return this.contactService.submitContactForm(dto);
    }
}
