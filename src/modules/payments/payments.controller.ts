import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Res } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import type { Request, Response } from 'express';
import { Public, SkipCheckPermission } from 'src/decorators/customize';
import type { RefundRequestDto } from './dto/refund-vnpay.dto';
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @SkipCheckPermission()
  @Public()
  createPayment(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.paymentsService.createPaymentUrl(req, res);
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
  findAll() {
    return this.paymentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto) {
    return this.paymentsService.update(+id, updatePaymentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.paymentsService.remove(+id);
  }
}
