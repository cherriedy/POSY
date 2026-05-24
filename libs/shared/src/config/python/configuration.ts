import { registerAs } from '@nestjs/config';

export default registerAs('python', () => ({
  url: process.env.PYTHON_URL,
}));
