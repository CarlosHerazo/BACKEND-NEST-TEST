import { registerAs } from '@nestjs/config';

export default registerAs('wompi', () => ({
  baseUrl: process.env.WOMPI_BASE_URL || 'https://api-sandbox.co.uat.wompi.dev/v1',
  publicKey: process.env.WOMPI_PUBLIC_KEY,
  privateKey: process.env.WOMPI_PRIVATE_KEY,
  eventsKey: process.env.WOMPI_EVENTS_KEY,
  integrityKey: process.env.WOMPI_INTEGRITY_KEY,
}));
