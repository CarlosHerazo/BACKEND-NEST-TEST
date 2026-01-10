import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  apiPrefix: process.env.API_PREFIX || 'api/v1',
  baseFee: parseInt(process.env.BASE_FEE || '1000', 10),
  deliveryFee: parseInt(process.env.DELIVERY_FEE || '5000', 10),
}));
