export enum MessageType {
  USER_LOGIN = 'USER_LOGIN',
  ROOM_JOIN = 'ROOM_JOIN',
  MESSAGE_SEND = 'MESSAGE_SEND',
  MESSAGE_NEW = 'MESSAGE_NEW',
  ERROR = 'ERROR',
  ROOM_CREATE = 'ROOM_CREATE',
  ROOM_NEW = 'ROOM_NEW',
  ROOM_RENAME = 'ROOM_RENAME',
  ROOM_RENAMED = 'ROOM_RENAMED',
  ROOM_DELETE = 'ROOM_DELETE',
  ROOM_DELETED = 'ROOM_DELETED',
}

export interface ChatMessage {
  id?: number;
  text: string;
  userId: number;
  roomId: number;
  authorName: string;
  createdAt: string;
}

export interface WSMessage {
  type: MessageType;
  payload: any;
}

export interface Room {
  id: number;
  name: string;
  ownerId: number;
}
