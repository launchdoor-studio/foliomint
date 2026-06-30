import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';

import * as schema from './schema';

const useTurso =
  process.env.NODE_ENV === 'production' &&
  process.env.TURSO_DATABASE_URL &&
  process.env.TURSO_DATABASE_URL.trim() !== '';

const client = createClient(
  useTurso
    ? {
        url: process.env.TURSO_DATABASE_URL!,
        authToken: process.env.TURSO_AUTH_TOKEN ?? '',
      }
    : {
        url: (process.env.DATABASE_URL || 'file:./data/dev.db').trim() || 'file:./data/dev.db',
      },
);

export const db = drizzle(client, { schema });
export type Database = typeof db;
