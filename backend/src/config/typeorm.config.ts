import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { config } from 'dotenv';

config(); // Ładowanie zmiennych środowiskowych

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  // Render używa DATABASE_URL, więc sprawdzamy najpierw to. Jeśli nie ma DATABASE_URL, używamy osobnych zmiennych
  url: process.env.DATABASE_URL,
  host: process.env.DATABASE_URL ? undefined : process.env.DB_HOST,
  port: process.env.DATABASE_URL ? undefined : parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DATABASE_URL ? undefined : process.env.DB_USERNAME,
  password: process.env.DATABASE_URL ? undefined : process.env.DB_PASSWORD,
  database: process.env.DATABASE_URL ? undefined : process.env.DB_DATABASE,
  entities: [__dirname + '/../**/*.entity.{js,ts}'],
  synchronize: false, // używamy migracji, więc wyłączamy synchronizację
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  // Render wymaga SSL
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
};
