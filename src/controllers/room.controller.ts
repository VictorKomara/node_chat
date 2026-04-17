/* eslint-disable no-console */
import type { Request, Response } from 'express';
import { Room } from '../models/Room.model';
import { Message } from '../models/Message.model';
import { User } from '../models/User.model';
import { UserRoom } from '../models/UserRoom.model';

export const roomController = {
  // Отримати всі доступні кімнати
  getAll: async (req: Request, res: Response) => {
    try {
      const rooms = await Room.findAll();

      res.json(rooms);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching rooms' });
    }
  },

  // Створити нову кімнату
  create: async (req: Request, res: Response) => {
    try {
      const { name } = req.body;

      if (!name) {
        return res.status(400).json({ message: 'Name is required' });
      }

      const room = await Room.create({ name });

      res.status(201).json(room);
    } catch (error) {
      res.status(500).json({ message: 'Error creating room' });
    }
  },

  // join: async (req: Request, res: Response) => {
  //   const { roomId, userId } = req.body;
  //   await UserRoom.create({ roomId, userId });
  //   res.status(200).json({ message: 'Joined successfully' });
  // },

  join: async (req: Request, res: Response) => {
    const { id } = req.params; // Отримуємо id з URL
    const { userId } = req.body;

    try {
      await UserRoom.findOrCreate({ where: { roomId: id, userId } });
      res.status(200).json({ message: 'Joined' });
    } catch (err) {
      res.status(500).json({ message: 'Error joining room' });
    }
  },

  checkMembership: async (req: Request, res: Response) => {
    const { id, userId } = req.params;
    const membership = await UserRoom.findOne({
      where: { roomId: id, userId },
    });

    res.json({ isMember: !!membership });
  },

  // Отримати історію повідомлень кімнати (Найважливіше!)
  getMessages: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const messages = await Message.findAll({
        where: { roomId: id },
        include: [
          {
            model: User,
            attributes: ['username'], // Тягнемо тільки ім'я автора
          },
        ],
        order: [['createdAt', 'ASC']], // Від старіших до новіших
      });

      // Перетворюємо дані у зручний формат
      const formattedMessages = messages.map((msg) => ({
        id: msg.id,
        text: msg.text,
        userId: msg.userId,
        roomId: msg.roomId,
        authorName: msg.author?.username || 'Unknown',
        createdAt: msg.createdAt,
      }));

      res.json(formattedMessages);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching messages' });
    }
  },
};
