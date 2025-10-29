import { Injectable, Req, Res } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import moment from 'moment';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { sortObject } from 'src/utils/vnpay.util';
let crypto = require('crypto');
let querystring = require('qs');

@Injectable()
export class PaymentsService {
  constructor(private configService: ConfigService) {}
  create(createPaymentDto: CreatePaymentDto) {
    return 'This action adds a new payment';
  }

  findAll() {
    return `This action returns all payments`;
  }

  findOne(id: number) {
    return `This action returns a #${id} payment`;
  }

  update(id: number, updatePaymentDto: UpdatePaymentDto) {
    return `This action updates a #${id} payment`;
  }

  remove(id: number) {
    return `This action removes a #${id} payment`;
  }

  createPaymentUrl(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    let ipAddr =
      req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || '127.0.0.1';

    // if ipAddr is Array, get first element
    if (Array.isArray(ipAddr)) {
      ipAddr = ipAddr[0];
    }

    if (typeof ipAddr === 'string') {
      ipAddr = ipAddr.replace('::ffff:', '');
      if (ipAddr === '::1') ipAddr = '127.0.0.1';
    }

    let currentDate = new Date();
    let createDate = moment(currentDate).format('YYYYMMDDHHmmss');
    let tmnCode = this.configService.get<string>('VNP_TMN_CODE');
    let secretKey = this.configService.get<string>('VNP_HASH_SECRET');
    let vnpUrl = this.configService.get<string>('VNP_URL');
    let returnUrl = this.configService.get<string>('VNP_RETURN_URL');
    let orderId = moment(currentDate).format('DDHHmmss');
    let amount = 49000;
    let locale = 'vn';
    let currCode = 'VND';

    let vnp_Params = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = tmnCode;
    vnp_Params['vnp_Locale'] = locale;
    vnp_Params['vnp_CurrCode'] = currCode;
    vnp_Params['vnp_TxnRef'] = Date.now().toString(); //tes demo
    vnp_Params['vnp_OrderInfo'] = 'Thanh toan cho ma GD:' + orderId;
    vnp_Params['vnp_OrderType'] = 'other';
    vnp_Params['vnp_Amount'] = amount * 100; // VNPay yêu cầu đơn vị = đồng × 100
    vnp_Params['vnp_ReturnUrl'] = returnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = createDate;

    // if (bankCode !== null && bankCode !== '') {
    //   vnp_Params['vnp_BankCode'] = bankCode;
    // }
    // vnp_Params['vnp_BankCode'] = 'NCB';

    vnp_Params = sortObject(vnp_Params);
    let signData = querystring.stringify(vnp_Params, { encode: false });
    let hmac = crypto.createHmac('sha512', secretKey);
    let signed = hmac.update(new Buffer(signData, 'utf-8')).digest('hex');
    vnp_Params['vnp_SecureHash'] = signed;
    vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });

    return {
      vnpUrl,
    };
  }

  verifyReturn(@Req() req: Request, @Res() res: Response) {
    // logic:
    // Xóa vnp_SecureHash và vnp_SecureHashType

    // Tự tính lại chữ ký hash

    // So sánh với hash VNPay gửi

    // Nếu trùng → giao dịch hợp lệ.
    let vnp_Params = req.query;

    let secureHash = vnp_Params['vnp_SecureHash'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);

    let tmnCode = this.configService.get<string>('VNP_TMN_CODE');
    let secretKey = this.configService.get<string>('VNP_HASH_SECRET');

    let signData = querystring.stringify(vnp_Params, { encode: false });

    let hmac = crypto.createHmac('sha512', secretKey);
    let signed = hmac.update(new Buffer(signData, 'utf-8')).digest('hex');

    if (secureHash === signed) {
      //Kiem tra xem du lieu trong db co hop le hay khong va thong bao ket qua
      console.log('chekc', vnp_Params);
      return res.status(200).json({
        message: 'success',
        code: vnp_Params['vnp_ResponseCode'],
        data: vnp_Params,
      });
    } else {
      return res.status(200).json({
        message: 'Checksum failed',
        code: '97',
      });
    }
  }
}
