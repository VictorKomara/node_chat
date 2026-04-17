/* eslint-disable no-console */

'use strict';

import 'dotenv/config';
import express from 'express';
import http from 'http';
import cors from 'cors';
import { WebSocketServer, WebSocket } from 'ws';
import { initDB } from './db';
import { roomRouter } from './routes/room.router';
import { usersRouter } from './routes/users.router';
import { MessageType, WSMessage } from './shared/types';
import { Message } from './models/Message.model';
import { User } from './models/User.model';
import { Room } from './models/Room.model';

interface ExtendedWebSocket extends WebSocket {
  currentRoom?: number;
}

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

app.use('/api', roomRouter);
app.use('/api', usersRouter);

app.use((req, res) => {
  res.status(404).json({ message: 'Page not found' });
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Використовуємо Record для динамічних кімнат
const rooms: Record<number, Set<ExtendedWebSocket>> = {};

// WebSocket логіка тут...
wss.on('connection', (ws: ExtendedWebSocket) => {
  console.log('Нове підключення встановлено');

  ws.on('message', async (data: string) => {
    try {
      const message: WSMessage = JSON.parse(data);
      const { type, payload } = message; // Деструктуризація!

      console.log('Отримано повідомлення:', message);

      switch (type) {
        case MessageType.ROOM_JOIN: {
          const rId = payload.roomId;

          // Якщо кімнати ще немає в пам'яті сервера — створюємо її
          if (!rooms[rId]) {
            rooms[rId] = new Set();
          }

          // Видаляємо з попередньої кімнати, якщо була
          if (ws.currentRoom && rooms[ws.currentRoom]) {
            rooms[ws.currentRoom].delete(ws);
          }

          if (ws.currentRoom === rId) {
            break;
          }

          rooms[rId].add(ws);
          ws.currentRoom = rId;
          console.log(`Користувач приєднався до кімнати ${rId}`);

          break;
        }

        case MessageType.ROOM_CREATE: {
          try {
            const { name, userId } = payload; // Отримуємо name
            // та userId від клієнта

            // 1. Створюємо кімнату в БД
            const newRoom = await Room.create({
              name,
              ownerId: userId, // Записуємо власника!
            });

            // 2. Розсилаємо ВУСІМ підключеним клієнтам (wss.clients)
            const broadcastData = JSON.stringify({
              type: MessageType.ROOM_NEW,
              payload: newRoom,
            });

            wss.clients.forEach((client) => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(broadcastData);
              }
            });
          } catch (err) {
            console.error('Помилка створення кімнати через WS:', err);
          }

          break;
        }

        case MessageType.ROOM_RENAME: {
          const { roomId, newName, userId } = payload;
          const room = await Room.findByPk(roomId);

          // Перевірка прав: тільки власник може редагувати
          if (room && room.ownerId === userId) {
            room.name = newName;
            await room.save();

            const broadcastData = JSON.stringify({
              type: MessageType.ROOM_RENAMED,
              payload: { roomId, newName },
            });

            wss.clients.forEach((client) => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(broadcastData);
              }
            });
          }
          break;
        }

        case MessageType.ROOM_DELETE: {
          const { roomId, userId } = payload;
          const room = await Room.findByPk(roomId);

          if (room && room.ownerId === userId) {
            await room.destroy(); // Переконайся, що в моделях стоїть CASCADE

            const broadcastData = JSON.stringify({
              type: MessageType.ROOM_DELETED,
              payload: { roomId },
            });

            wss.clients.forEach((client) => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(broadcastData);
              }
            });
          }
          break;
        }

        case MessageType.MESSAGE_SEND: {
          const { roomId, userId, text } = payload;

          try {
            // 1. Зберігаємо в базу даних
            const newMessage = await Message.create({
              text,
              userId,
              roomId,
            });

            // 2. Знаходимо автора, щоб відправити ім'я на фронтенд
            const user = await User.findByPk(userId);

            const clients = rooms[roomId];

            if (clients) {
              clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                  client.send(
                    JSON.stringify({
                      type: MessageType.MESSAGE_NEW,
                      payload: {
                        id: newMessage.id,
                        text: newMessage.text,
                        userId: newMessage.userId,
                        roomId: newMessage.roomId,
                        authorName: user?.username || 'Unknown',
                        createdAt: newMessage.createdAt,
                      },
                    }),
                  );
                }
              });
            }
          } catch (err) {
            console.error('Помилка збереження повідомлення:', err);
          }
          break;
        }

        default:
          console.log('Невідомий тип повідомлення', type);
      }
    } catch (err) {
      console.error('Помилка парсингу JSON:', err);
    }
  });

  ws.on('close', () => {
    // Не забути видалити сокет з усіх кімнат при відключенні
    if (ws.currentRoom && rooms[ws.currentRoom]) {
      rooms[ws.currentRoom].delete(ws);
    }

    console.log('Клієнт від’єднався');
  });
});

const start = async () => {
  try {
    await initDB();
    server.listen(5700, () => console.log('🚀 Server started on port 5700'));
  } catch (error) {
    console.error('Failed to start server:', error);
  }
};

start();
