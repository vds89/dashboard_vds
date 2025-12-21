// prisma.config.ts
import { defineConfig } from '@prisma/config';
import * as dotenv from 'dotenv';

// Carica esplicitamente il file .env
dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL non è definita nel file .env");
}

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL,
  },
  // Nuova sezione per Prisma 7
  migrations: {
    seed: 'ts-node --compiler-options {"module":"CommonJS"} ./prisma/seed.ts',
  },
});