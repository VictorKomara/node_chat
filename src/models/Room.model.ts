import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  HasMany,
  BelongsTo,
  BelongsToMany,
} from 'sequelize-typescript';
import { Message } from './Message.model';
import { UserRoom } from './UserRoom.model';
import { User } from './User.model';

@Table({ tableName: 'rooms' })
export class Room extends Model {
  @Column({ type: DataType.STRING, allowNull: false })
  declare name: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER })
  declare ownerId: number; // Творець кімнати

  @BelongsTo(() => User)
  declare owner: User;

  @HasMany(() => Message, {
    onDelete: 'CASCADE',
    hooks: true,
  })
  declare messages: Message[];

  @BelongsToMany(() => User, () => UserRoom)
  declare users: User[];
}
