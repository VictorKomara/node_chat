import { Router } from 'express';
import { roomController } from '../controllers/room.controller';

export const roomRouter = Router();

roomRouter.get('/rooms', roomController.getAll);
roomRouter.post('/rooms', roomController.create);
roomRouter.get('/rooms/:id/messages', roomController.getMessages);
roomRouter.get('/rooms/:id/membership/:userId', roomController.checkMembership);
roomRouter.post('/rooms/:id/join', roomController.join);
