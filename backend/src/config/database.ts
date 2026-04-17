import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

const envFileLocal = path.resolve(__dirname, '../../.env.local');
dotenv.config({ path: fs.existsSync(envFileLocal) ? envFileLocal : path.resolve(__dirname, '../../.env') });

const NODE_ENV = process.env.NODE_ENV || 'production';

interface DatabaseConfig {
  username: string;
  password: string;
  database: string;
  host: string;
  port: number;
  dialect: 'postgres' | 'mysql';
  logging: boolean | typeof console.log;
}

interface Config {
  development: DatabaseConfig;
  production: DatabaseConfig;
  test: DatabaseConfig;
}

const DATABASE_DIALECT = (process.env.DB_DIALECT || 'postgres') as 'postgres' | 'mysql';
const DB_HOST = process.env.DB_HOST;
const DB_PORT = process.env.DB_PORT;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME;

if (NODE_ENV === 'production') {
  const requiredVars = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'JWT_SECRET'];
  const missing = requiredVars.filter(v => !process.env[v]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables for production: ${missing.join(', ')}`);
  }
}

const config: Config = {
  development: {
    username: DB_USER || 'postgres',
    password: DB_PASSWORD || 'postgres',
    database: DB_NAME || 'scrapair_dev',
    host: DB_HOST || 'localhost',
    port: parseInt(DB_PORT || '5432'),
    dialect: DATABASE_DIALECT,
    logging: NODE_ENV === 'development' ? console.log : false
  },
  production: {
    username: DB_USER || '',
    password: DB_PASSWORD || '',
    database: DB_NAME || '',
    host: DB_HOST || '',
    port: parseInt(DB_PORT || '5432'),
    dialect: DATABASE_DIALECT,
    logging: false
  },
  test: {
    username: DB_USER || 'postgres',
    password: DB_PASSWORD || 'postgres',
    database: 'scrapair_test',
    host: DB_HOST || 'localhost',
    port: parseInt(DB_PORT || '5432'),
    dialect: DATABASE_DIALECT,
    logging: false
  }
};

export default config;
module.exports = config;
