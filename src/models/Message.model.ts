import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { User } from './User.model';
import { Room } from './Room.model';

@Table({ tableName: 'messages' })
export class Message extends Model {
  @Column({ type: DataType.TEXT, allowNull: false })
  declare text: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER })
  declare userId: number;

  @BelongsTo(() => User)
  declare author: User;

  @ForeignKey(() => Room)
  @Column({ type: DataType.INTEGER, onDelete: 'CASCADE' })
  declare roomId: number;

  @BelongsTo(() => Room)
  declare room: Room;
}
