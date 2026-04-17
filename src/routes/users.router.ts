import { Router } from 'express';
import { usersController } from '../controllers/users.controller';

export const usersRouter = Router();

// Маршрут для логіну/реєстрації
usersRouter.post('/login', usersController.login);

// Маршрут для отримання списку (може знадобитися в майбутньому)
usersRouter.get('/users', usersController.getAll);
