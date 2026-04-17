import { DataTypes, Model, Sequelize, ModelStatic } from 'sequelize';

interface PostMessageAttributes {
  id?: number;
  postId: number;
  senderId: number;
  recipientId: number;
  subject: string;
  message: string;
  isRead?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface PostMessageInstance extends Model<PostMessageAttributes>, PostMessageAttributes {}

module.exports = (sequelize: Sequelize): ModelStatic<PostMessageInstance> => {
  const PostMessage = sequelize.define<PostMessageInstance>(
    'PostMessage',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      postId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'waste_posts',
          key: 'id'
        },
        comment: 'Waste post being inquired about'
      },
      senderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        comment: 'User sending the inquiry (recycler)'
      },
      recipientId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        comment: 'Business owner receiving the inquiry'
      },
      subject: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Message subject'
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'Message content'
      },
      isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Whether recipient has read the message'
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    },
    {
      tableName: 'post_messages',
      timestamps: true,
      indexes: [
        { fields: ['postId'] },
        { fields: ['senderId'] },
        { fields: ['recipientId'] },
        { fields: ['isRead'] }
      ]
    }
  );

  return PostMessage;
};
