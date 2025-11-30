import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Res } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import type { Request, Response } from 'express';
import { Public, ResponseMessage, SkipCheckPermission, User } from 'src/decorators/customize';
import type { RefundRequestDto } from './dto/refund-vnpay.dto';
import type { IUser } from '../users/interface/user.interface';
import { Permission } from 'src/decorators/permission.decorator';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @ResponseMessage('create payment url')
  @SkipCheckPermission()
  @Permission('Create a payment url', 'PAYMENTS')
  createPayment(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @User() user: IUser,
    @Body('planId') planId: number,
  ) {
    return this.paymentsService.createPaymentUrl(req, res, user, planId);
  }

  @Get('vnpay_return')
  @SkipCheckPermission()
  @Public()
  vnpayReturn(@Req() req: Request, @Res() res: Response) {
    return this.paymentsService.verifyReturn(req, res);
  }

  @Post('querydr')
  @SkipCheckPermission()
  @Public()
  async queryTransaction(@Req() req: Request, @Body('transDate') transDate: string) {
    return await this.paymentsService.handleQueryTransaction(req, transDate);
  }

  @Post('refund')
  @SkipCheckPermission()
  @Public()
  async refund(@Req() req: Request, @Body() body: RefundRequestDto) {
    return this.paymentsService.handleRefund(req, body);
  }

  @Get()
  @Public()
  @SkipCheckPermission()
  @Permission('Get all payments', 'PAYMENTS')
  @ResponseMessage('Find All Payments')
  GetAll() {
    return this.paymentsService.findAll();
  }
}
