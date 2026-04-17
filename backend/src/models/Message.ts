import { DataTypes, Model, Optional, Sequelize, ModelStatic } from 'sequelize';

interface MessageAttributes {
  id: number;
  conversationId: number;
  senderId: number;
  recipientId: number;
  content: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface MessageCreationAttributes
  extends Optional<MessageAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export interface MessageInstance extends Model<MessageAttributes>, MessageAttributes {}

module.exports = (sequelize: Sequelize): ModelStatic<MessageInstance> => {
  const Message = sequelize.define<MessageInstance>(
    'Message',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      conversationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'conversations',
          key: 'id'
        }
      },
      senderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      recipientId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          len: [0, 5000]
        }
      },
      imageUrl: {
        type: DataTypes.STRING(500),
        allowNull: true
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
      modelName: 'Message',
      tableName: 'messages',
      timestamps: true,
      indexes: [
        {
          name: 'idx_message_conversation',
          fields: ['conversationId']
        },
        {
          name: 'idx_message_sender',
          fields: ['senderId']
        },
        {
          name: 'idx_message_created',
          fields: ['createdAt']
        }
      ]
    }
  );

  return Message;
};
