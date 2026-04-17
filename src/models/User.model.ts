'use strict';

import {
  Table,
  Column,
  Model,
  DataType,
  HasMany,
  BelongsToMany,
} from 'sequelize-typescript';
import { Message } from './Message.model';
import { Room } from './Room.model';
import { UserRoom } from './UserRoom.model';

@Table({ tableName: 'users' })
export class User extends Model {
  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  declare username: string;

  @HasMany(() => Message)
  declare messages: Message[];

  @BelongsToMany(() => Room, () => UserRoom)
  declare rooms: Room[];
}
