import {
  Table,
  Column,
  Model,
  ForeignKey,
  DataType,
} from 'sequelize-typescript';
import { Room } from './Room.model';
import { User } from './User.model';

@Table({ tableName: 'user_rooms' })
export class UserRoom extends Model {
  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, onDelete: 'CASCADE' })
  declare userId: number;

  @ForeignKey(() => Room)
  @Column({ type: DataType.INTEGER, onDelete: 'CASCADE' })
  declare roomId: number;
}
