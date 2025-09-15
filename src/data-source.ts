import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

const AppDataSource = new DataSource({
  type: 'postgres', // 🟢 تغییر از sqlite به postgres
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'postgres',
  database: process.env.DB_NAME || 'postgres',
  entities: [__dirname + '/src/**/*.entity{.ts,.js}'], // 🟢 اصلاح مسیر
  migrations: [__dirname + '/src/migrations/*{.ts,.js}', __dirname + '/src/seeds/*{.ts,.js}'], // 🟢 اصلاح مسیر
});

export default AppDataSource;
