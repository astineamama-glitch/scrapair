import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import config from '../config/database';

import fs from 'fs';
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : (fs.existsSync(path.join(__dirname, '..', '..', '.env.local')) ? '.env.local' : '.env');
dotenv.config({ path: path.join(__dirname, '..', '..', envFile) });

const env = (process.env.NODE_ENV || 'development') as keyof typeof config;
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    timezone: 'UTC',
    pool: dbConfig.pool || {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: false
    },
    ...(dbConfig.host && dbConfig.host.includes('supabase') && {
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    })
  }
);

const User = require('./User')(sequelize);
const Material = require('./Material')(sequelize);
const AdminUser = require('./AdminUser')(sequelize);
const WasteCategory = require('./WasteCategory')(sequelize);
const Report = require('./Report')(sequelize);
const UserRating = require('./UserRating')(sequelize);
const PostRating = require('./PostRating')(sequelize);
const SystemLog = require('./SystemLog')(sequelize);
const Feedback = require('./Feedback')(sequelize);
const Collection = require('./Collection')(sequelize);
const RatingDeductionRule = require('./RatingDeductionRule')(sequelize);
const RatingHistory = require('./RatingHistory')(sequelize);

(sequelize as any).models = {
  User,
  Material,
  AdminUser,
  WasteCategory,
  Report,
  UserRating,
  PostRating,
  SystemLog,
  Feedback,
  Collection,
  RatingDeductionRule,
  RatingHistory
};

const models: any = {
  User,
  Material,
  AdminUser,
  WasteCategory,
  Report,
  UserRating,
  PostRating,
  SystemLog,
  Feedback,
  Collection,
  RatingDeductionRule,
  RatingHistory
};

Object.keys(models).forEach((key) => {
  if (models[key].associate) {
    models[key].associate(models);
  }
});

if (process.env.NODE_ENV === 'development') {
  sequelize.authenticate()
    .then(() => {
    })
    .catch((err: any) => {
    });
} else {
}

export { sequelize, User, Material, AdminUser, WasteCategory, Report, UserRating, PostRating, SystemLog, Feedback, Collection, RatingDeductionRule, RatingHistory };
export default models;

