import { DataTypes, Model, Optional, Sequelize, ModelStatic } from 'sequelize';

interface ConversationAttributes {
  id: number;
  participant1Id: number;
  participant2Id: number;
  wastePostId?: number;
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface ConversationCreationAttributes
  extends Optional<ConversationAttributes, 'id' | 'createdAt' | 'updatedAt' | 'lastMessageAt'> {}

export interface ConversationInstance extends Model<ConversationAttributes>, ConversationAttributes {}

module.exports = (sequelize: Sequelize): ModelStatic<ConversationInstance> => {
  const Conversation = sequelize.define<ConversationInstance>(
    'Conversation',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      participant1Id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      participant2Id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      wastePostId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'waste_posts',
          key: 'id'
        }
      },
      lastMessageAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
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
      modelName: 'Conversation',
      tableName: 'conversations',
      timestamps: true,
      indexes: [
        {
          name: 'idx_conversation_participants',
          fields: ['participant1Id', 'participant2Id']
        },
        {
          name: 'idx_conversation_created',
          fields: ['createdAt']
        }
      ]
    }
  );

  return Conversation;
};

