export const vnpayConfig = {
  vnp_TmnCode: '52V6GE8C', // hoặc mã bạn được cấp khi đăng ký sandbox
  vnp_HashSecret: 'PQC97YYUZ41AFIM0I9L3GS01M1CY8C8H', // bí mật tương ứng
  vnp_Url: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
  vnp_Api: 'https://sandbox.vnpayment.vn/merchant_webapi/api/transaction',
  vnp_ReturnUrl: 'http://localhost:8080/api/v1/payments/vnpay_return',
};

export function sortObject(obj) {
  const sorted = {};
  const keys = Object.keys(obj).sort();

  keys.forEach((key) => {
    sorted[key] = encodeURIComponent(obj[key]).replace(/%20/g, '+');
  });

  return sorted;
}
