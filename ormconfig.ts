import * as dotenv from 'dotenv';

dotenv.config();

module.exports = {
  type: 'mysql',
  host: process.env.WALLET_DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.WALLET_DB_NAME,
  entities: ['src/**/*.entity{.ts,.js}'],
  migrations: ['src/database/migrations/*{.ts,.js}'],
};
