import { registerAs } from '@nestjs/config';

export default registerAs('momo', () => ({
  partner_code: process.env.MOMO_PARTNER_CODE,
  access_key: process.env.MOMO_ACCESS_KEY,
  secret_key: process.env.MOMO_SECRET_KEY,
  redirect_url: process.env.MOMO_REDIRECT_URL,
  ipn_url: process.env.MOMO_IPN_URL,
}));
