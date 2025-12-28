import 'reflect-metadata';
import './register-paths';

import fs from 'node:fs';
import path from 'path';
import dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import type { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

import { Account, Profile } from '@nx-apollo-auth-library';

const loadEnvFiles = () => {
  const stage = process.env.STAGE || process.env.NODE_ENV || 'development';
  const envFiles = [
    '.env',
    stage !== 'test' ? '.env.local' : null,
    `.env.${stage}`,
    `.env.${stage}.local`,
  ].filter(Boolean);
  const candidates = [process.cwd(), path.resolve(__dirname, '..')];
  const root =
    candidates.find((candidate) =>
      envFiles.some((file) => fs.existsSync(path.join(candidate, file))),
    ) || process.cwd();
  const uniqueFiles = [...new Set(envFiles)];
  const merged: Record<string, string> = {};

  for (const file of uniqueFiles) {
    const fullPath = path.join(root, file);
    if (!fs.existsSync(fullPath)) {
      continue;
    }
    Object.assign(merged, dotenv.parse(fs.readFileSync(fullPath)));
  }

  for (const [key, value] of Object.entries(merged)) {
    const currentValue = process.env[key];
    if (currentValue === undefined || currentValue === '') {
      process.env[key] = value;
    }
  }
};

loadEnvFiles();

const parseBoolean = (value: string | undefined, defaultValue = false) => {
  if (value === undefined) {
    return defaultValue;
  }
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
};

const getRequiredEnv = (name: string) => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

const buildDataSource = () => {
  const root = process.cwd();
  const url = process.env.DATABASE_URL;
  const sslEnabled = parseBoolean(process.env.DATABASE_SSL);
  const rejectUnauthorized = parseBoolean(process.env.DATABASE_SSL_REJECT_UNAUTHORIZED, true);
  const ssl = sslEnabled ? { rejectUnauthorized } : undefined;
  const schema = process.env.DATABASE_SCHEMA ?? 'public';
  const migrationsDir = process.env.DATABASE_MIGRATIONS_DIR ?? 'migrations';
  const migrationsPath = path.isAbsolute(migrationsDir)
    ? migrationsDir
    : path.join(root, migrationsDir);
  const migrations = [path.join(migrationsPath, '*.{ts,js}')];

  const entities =
    [Account, Profile] as unknown as NonNullable<PostgresConnectionOptions['entities']>;
  const baseOptions: PostgresConnectionOptions = {
    type: 'postgres',
    entities,
    schema,
    migrations,
    synchronize: parseBoolean(process.env.DATABASE_SYNCHRONIZE),
    logging: parseBoolean(process.env.DATABASE_LOGGING),
  };

  if (url) {
    return new DataSource({
      ...baseOptions,
      url,
      ssl,
    });
  }

  const port = process.env.DATABASE_PORT ? Number(process.env.DATABASE_PORT) : 5432;
  if (!Number.isFinite(port)) {
    throw new Error('DATABASE_PORT must be a valid number');
  }

  return new DataSource({
    ...baseOptions,
    host: getRequiredEnv('DATABASE_HOST'),
    port,
    username: getRequiredEnv('DATABASE_USER'),
    password: process.env.DATABASE_PASSWORD ?? '',
    database: getRequiredEnv('DATABASE_NAME'),
    ssl,
  });
};

export const appDataSource = buildDataSource();
let initPromise: Promise<DataSource> | null = null;

export const getDataSource = async () => {
  if (appDataSource.isInitialized) {
    return appDataSource;
  }

  if (!initPromise) {
    initPromise = appDataSource.initialize().catch((error) => {
      initPromise = null;
      throw error;
    });
  }

  return initPromise;
};
