const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env.local or .env.production
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.local';
dotenv.config({ path: path.join(__dirname, '../../', envFile) });

const NODE_ENV = process.env.NODE_ENV || 'development';
const DATABASE_DIALECT = process.env.DB_DIALECT || 'postgres';

const config = {
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

module.exports = config;
