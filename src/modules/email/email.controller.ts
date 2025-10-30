import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EmailService } from './email.service';
import { Public, SkipCheckPermission } from 'src/decorators/customize';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Controller('email')
export class EmailController {
  constructor(
    private readonly emailService: MailerService,
    private readonly configService: ConfigService,
  ) {}
  @Post('verify-upgradeVip')
  @Public()
  @SkipCheckPermission()
  handleSendVerifyUpgradeVipEmail() {
    this.emailService.sendMail({
      from: `Tran van luong ${this.configService.get<string>('EMAIL_AUTH_USER')}`,
      to: 'luong03510@gmail.com',
      subject: `How to Send Emails with Nodemailer`,
      template: 'test',
    });
  }
}
