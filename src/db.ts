/* eslint-disable no-console */
'use strict';

import { Sequelize } from 'sequelize-typescript';
import { User } from './models/User.model';
import { Message } from './models/Message.model';
import { Room } from './models/Room.model';
import { UserRoom } from './models/UserRoom.model';

// Витягуємо змінні середовища
const {
  POSTGRES_HOST,
  POSTGRES_PORT,
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  POSTGRES_DB,
} = process.env;

// Створюємо інстанс Sequelize (з sequelize-typescript!)
export const sequelize = new Sequelize({
  database: POSTGRES_DB || 'postgres',
  username: POSTGRES_USER || 'postgres',
  host: POSTGRES_HOST || 'localhost',
  dialect: 'postgres',
  port: Number(POSTGRES_PORT) || 5432,
  password: POSTGRES_PASSWORD || '123123',
  models: [User, Message, Room, UserRoom],
  logging: false,
});

export const initDB = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    console.log('✅ Database synced and connected.');
  } catch (err) {
    console.error('❌ Database connection error:', err);
  }
};
