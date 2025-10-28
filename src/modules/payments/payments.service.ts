import { Injectable } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import * as crypto from 'crypto';
import moment from 'moment';
import * as qs from 'qs';
import { vnpayConfig } from './config/vnpay.config';

@Injectable()
export class PaymentsService {
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

  createPaymentUrl(orderId: string, amount: number, ipAddr: string) {
    // const date = new Date();
    // const createDate = moment(date).format('YYYYMMDDHHmmss');
    // let vnp_Params: Record<string, string> = {
    //   vnp_Version: '2.1.0',
    //   vnp_Command: 'pay',
    //   vnp_TmnCode: vnpayConfig.vnp_TmnCode,
    //   vnp_Locale: 'vn',
    //   vnp_CurrCode: 'VND',
    //   vnp_TxnRef: orderId,
    //   vnp_OrderInfo: `Thanh toan don hang ${orderId}`,
    //   vnp_OrderType: 'other',
    //   vnp_Amount: (amount * 100).toString(),
    //   vnp_ReturnUrl: vnpayConfig.vnp_ReturnUrl,
    //   vnp_IpAddr: ipAddr,
    //   vnp_CreateDate: createDate,
    // };
    // //  Sắp xếp theo tên key
    // vnp_Params = Object.keys(vnp_Params)
    //   .sort()
    //   .reduce(
    //     (obj, key) => {
    //       obj[key] = vnp_Params[key];
    //       return obj;
    //     },
    //     {} as Record<string, string>,
    //   );
    // // . Tạo chuỗi ký KHÔNG encode
    // const signData = qs.stringify(vnp_Params, { encode: false });
    // //  Hash SHA512
    // const hmac = crypto.createHmac('sha512', vnpayConfig.vnp_HashSecret);
    // const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    // // Gắn vào tham số & encode để tạo URL
    // vnp_Params['vnp_SecureHash'] = signed;
    // const paymentUrl = vnpayConfig.vnp_Url + '?' + qs.stringify(vnp_Params, { encode: true });
    // console.log(' signData:', signData);
    // console.log(' signed:', signed);
    // return paymentUrl;
  }

  verifyReturn(query: Record<string, string | string[]>) {
    const vnp_SecureHash = query['vnp_SecureHash'] as string;
    delete query['vnp_SecureHash'];
    delete query['vnp_SecureHashType'];

    const sorted = Object.keys(query)
      .sort()
      .reduce(
        (acc, key) => {
          acc[key] = query[key] as string;
          return acc;
        },
        {} as Record<string, string>,
      );

    const signData = qs.stringify(sorted, { encode: false });
    const hmac = crypto.createHmac('sha512', vnpayConfig.vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    if (vnp_SecureHash === signed && query['vnp_ResponseCode'] === '00') {
      return { success: true, message: 'Thanh toán thành công' };
    } else {
      return { success: false, message: 'Thanh toán thất bại' };
    }
  }
}
