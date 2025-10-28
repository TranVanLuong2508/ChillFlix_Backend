import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Res, Query } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import type { Request, Response } from 'express';
import { Public, SkipCheckPermission } from 'src/decorators/customize';
import * as crypto from 'crypto';
import moment from 'moment';
import * as qs from 'qs';
import { sortObject, vnpayConfig } from './config/vnpay.config';
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @SkipCheckPermission()
  @Public()
  createPayment(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    // let ipAddr =
    //   req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || '127.0.0.1';

    // // Nếu là array, lấy phần tử đầu
    // if (Array.isArray(ipAddr)) {
    //   ipAddr = ipAddr[0];
    // }

    // // Loại bỏ IPv6 prefix
    // ipAddr = ipAddr.replace('::ffff:', '');

    // // Nếu là IPv6 thuần, dùng localhost
    // if (ipAddr.includes(':')) {
    //   ipAddr = '127.0.0.1';
    // }

    // const orderId = Date.now().toString();
    // const amount = 49000;

    // const paymentUrl = this.paymentsService.createPaymentUrl(orderId, amount, ipAddr as string);
    // return {
    //   paymentUrl: paymentUrl,
    // };

    let date = new Date();
    let createDate = moment(date).format('YYYYMMDDHHmmss');

    let ipAddr = '127.0.0.1';
    let tmnCode = vnpayConfig.vnp_TmnCode;
    let secretKey = vnpayConfig.vnp_HashSecret;
    let vnpUrl = vnpayConfig.vnp_Url;
    let returnUrl = vnpayConfig.vnp_ReturnUrl;
    let orderId = moment(date).format('DDHHmmss');
    let amount = 50000;
    // let bankCode = req.body.bankCode;

    // let locale = req.body.language;
    // if (locale === null || locale === '') {
    //   locale = 'vn';
    // }
    let currCode = 'VND';
    let vnp_Params = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = tmnCode;
    vnp_Params['vnp_Locale'] = 'vn';
    vnp_Params['vnp_CurrCode'] = currCode;
    vnp_Params['vnp_TxnRef'] = Date.now().toString(); //tes demo
    vnp_Params['vnp_OrderInfo'] = 'Thanh toan cho ma GD:' + orderId;
    vnp_Params['vnp_OrderType'] = 'other';
    vnp_Params['vnp_Amount'] = amount * 100;
    vnp_Params['vnp_ReturnUrl'] = returnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = createDate;
    // if (bankCode !== null && bankCode !== '') {
    //   vnp_Params['vnp_BankCode'] = bankCode;
    // }

    vnp_Params['vnp_BankCode'] = 'NCB';
    vnp_Params = sortObject(vnp_Params);

    let querystring = require('qs');
    let signData = querystring.stringify(vnp_Params, { encode: false });
    let crypto = require('crypto');
    let hmac = crypto.createHmac('sha512', secretKey);
    let signed = hmac.update(new Buffer(signData, 'utf-8')).digest('hex');
    vnp_Params['vnp_SecureHash'] = signed;
    vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });

    return {
      vnpUrl,
    };
  }

  @Get('vnpay_return')
  @SkipCheckPermission()
  @Public()
  vnpayReturn(@Req() req: Request, @Res() res: Response) {
    let vnp_Params = req.query;

    let secureHash = vnp_Params['vnp_SecureHash'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);

    let tmnCode = vnpayConfig.vnp_TmnCode;
    let secretKey = vnpayConfig.vnp_HashSecret;

    let querystring = require('qs');
    let signData = querystring.stringify(vnp_Params, { encode: false });
    let crypto = require('crypto');
    let hmac = crypto.createHmac('sha512', secretKey);
    let signed = hmac.update(new Buffer(signData, 'utf-8')).digest('hex');

    if (secureHash === signed) {
      //Kiem tra xem du lieu trong db co hop le hay khong va thong bao ket qua
      console.log('chekc', vnp_Params);
      return {
        message: 'success',
        code: vnp_Params['vnp_ResponseCode'],
      };
    } else {
      return {
        message: 'success',
        code: '97',
      };
    }
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
