import { DataTypes, Model, Optional, Sequelize, ModelStatic } from 'sequelize';

interface NotificationAttributes {
  id: number;
  userId: number;
  type: 'MESSAGE' | 'COLLECTION_REQUEST' | 'INQUIRY' | 'VERIFICATION' | 'MATERIAL_POSTED' | 'WASTE_POST_CREATED';
  title: string;
  message: string;
  relatedId?: number;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface NotificationCreationAttributes
  extends Optional<NotificationAttributes, 'id' | 'read' | 'createdAt' | 'updatedAt'> {}

export interface NotificationInstance extends Model<NotificationAttributes>, NotificationAttributes {}

module.exports = (sequelize: Sequelize): ModelStatic<NotificationInstance> => {
  const Notification = sequelize.define<NotificationInstance>(
    'Notification',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      type: {
        type: DataTypes.ENUM('MESSAGE', 'COLLECTION_REQUEST', 'INQUIRY', 'VERIFICATION', 'MATERIAL_POSTED', 'WASTE_POST_CREATED'),
        allowNull: false,
        defaultValue: 'MESSAGE'
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      relatedId: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      read: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
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
      modelName: 'Notification',
      tableName: 'notifications',
      timestamps: true,
      indexes: [
        {
          name: 'idx_notification_user',
          fields: ['userId']
        },
        {
          name: 'idx_notification_read',
          fields: ['read']
        },
        {
          name: 'idx_notification_created',
          fields: ['createdAt']
        }
      ]
    }
  );

  return Notification;
};
