import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  MONGO_URI: z.string().min(1, 'MONGO_URI is required'),
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  ACCESS_TOKEN_EXPIRES: z.string().default('15m'),
  REFRESH_TOKEN_EXPIRES_DAYS: z.coerce.number().default(7),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  COOKIE_CROSS_SITE: z
    .preprocess((val) => val === true || val === 'true', z.boolean())
    .default(false),
  ADMIN_NAME: z.string().default('Super Admin'),
  ADMIN_EMAIL: z.string().email('Invalid ADMIN_EMAIL'),
  ADMIN_PASSWORD: z.string().min(8, 'ADMIN_PASSWORD must be at least 8 characters'),
  GROQ_API_KEY: z.string().optional().default(''),
  GROQ_MODEL: z.string().default('llama-3.3-70b-versatile'),
}).refine(
  (data) => data.JWT_ACCESS_SECRET !== data.JWT_REFRESH_SECRET,
  {
    message: 'JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must differ',
    path: ['JWT_REFRESH_SECRET'],
  }
);

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Environment validation failed:');
  parsed.error.issues.forEach((issue) => {
    console.error(` - ${issue.path.join('.')}: ${issue.message}`);
  });
  process.exit(1);
}

export const env = parsed.data;
