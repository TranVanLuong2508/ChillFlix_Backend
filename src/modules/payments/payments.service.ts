import { Injectable, InternalServerErrorException, Req, Res } from '@nestjs/common';
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
    try {
      //ip khachs hàng
      let ipAddr =
        req.headers['x-forwarded-for'] || req.connection?.remoteAddress || req.socket?.remoteAddress || '127.0.0.1';

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
      let returnUrl = this.configService.get<string>('VNP_RETURN_URL');
      let orderId = moment(currentDate).format('DDHHmmss');
      let amount = 49000;
      let locale = 'vn';
      let currCode = 'VND';
      let orederInfor = 'Thanh toan qua VNPay cho don hang dang ky goi vip tren ChillFlix voi ma GD: ' + orderId;
      let orderType = 190003;

      let vnp_Params: any = {
        vnp_Version: '2.1.0',
        vnp_Command: 'pay',
        vnp_TmnCode: tmnCode,
        vnp_Locale: locale,
        vnp_CurrCode: currCode,
        vnp_TxnRef: orderId + '-' + moment(new Date()).format('HHmmss'),
        vnp_OrderInfo: orederInfor,
        vnp_OrderType: orderType,
        vnp_Amount: amount * 100, // VNPay yêu cầu đơn vị = đồng × 100
        vnp_ReturnUrl: returnUrl,
        vnp_IpAddr: ipAddr,
        vnp_CreateDate: createDate,
      };

      // if (bankCode !== null && bankCode !== '') {
      //   vnp_Params['vnp_BankCode'] = bankCode;
      // }
      // vnp_Params['vnp_BankCode'] = 'NCB';

      vnp_Params = sortObject(vnp_Params);
      let signData = querystring.stringify(vnp_Params, { encode: false }); //convert vnp_Params to qwuery string
      let hmac = crypto.createHmac('sha512', secretKey);

      let signed = hmac.update(new Buffer(signData, 'utf-8')).digest('hex');
      vnp_Params['vnp_SecureHash'] = signed;

      let vnpUrl = this.configService.get<string>('VNP_URL');
      vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });

      return {
        EC: 1,
        EM: 'Create VNPAY payment URL success',
        metadata: {
          redirectUrl: vnpUrl,
        },
      };
    } catch (error) {
      console.error('Error in Create VNPAY payment URL:', error.message);
      throw new InternalServerErrorException({
        EC: 0,
        EM: 'Error from create payment url service',
      });
    }
  }

  verifyReturn(@Req() req: Request, @Res() res: Response) {
    try {
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

      const frontendURL = this.configService.get<string>('FRONTEND_URL');
      if (secureHash === signed) {
        //add logic
        console.log('chekc', vnp_Params);
        res.redirect(`${frontendURL}`);

        // return res.status(200).json({
        //   message: 'success',
        //   code: vnp_Params['vnp_ResponseCode'],
        //   data: vnp_Params,
        // });
        // res.render("success", { code: vnp_Params["vnp_ResponseCode"] });
      } else {
        // res.redirect('frontend link you want to redirect')
        return res.status(200).json({
          message: 'Checksum failed',
          code: '97',
        });
      }
    } catch (error) {
      console.error('Error in verifyReturn VNPAY:', error.message);
      throw new InternalServerErrorException({
        EC: 0,
        EM: 'Error from verifyReturn service',
      });
    }
  }
}
