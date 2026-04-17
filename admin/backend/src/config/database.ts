import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables from .env.local, .env, or .env.production
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : (fs.existsSync(path.join(__dirname, '../../', '.env.local')) ? '.env.local' : '.env');
dotenv.config({ path: path.join(__dirname, '../../', envFile) });

const NODE_ENV = process.env.NODE_ENV || 'development';

interface DatabaseConfig {
  username: string;
  password: string;
  database: string;
  host: string;
  port: number;
  dialect: 'postgres' | 'mysql';
  logging: boolean | typeof console.log;
  pool?: {
    min: number;
    max: number;
    idle: number;
    acquire: number;
  };
}

interface Config {
  development: DatabaseConfig;
  production: DatabaseConfig;
  test: DatabaseConfig;
}

const DATABASE_DIALECT = (process.env.DB_DIALECT || 'postgres') as 'postgres' | 'mysql';

// Validate required database variables in production
if (NODE_ENV === 'production') {
  const requiredVars = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
  const missing = requiredVars.filter(v => !process.env[v]);
  if (missing.length > 0) {
    throw new Error(`❌ Missing required environment variables for production: ${missing.join(', ')}`);
  }
}

const config: Config = {
  development: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    dialect: DATABASE_DIALECT,
    logging: NODE_ENV === 'development' ? console.log : false,
    pool: {
      min: 2,
      max: 10,
      idle: 10000,
      acquire: 30000
    }
  },
  production: {
    username: process.env.DB_USER || '',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || '',
    host: process.env.DB_HOST || '',
    port: parseInt(process.env.DB_PORT || '6543'),
    dialect: DATABASE_DIALECT,
    logging: false,
    pool: {
      min: 5,
      max: 20,
      idle: 30000,
      acquire: 30000
    }
  },
  test: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: 'scrapair_test',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    dialect: DATABASE_DIALECT,
    logging: false,
    pool: {
      min: 1,
      max: 5,
      idle: 10000,
      acquire: 30000
    }
  }
};

export default config;
