import { DataTypes, Model, Sequelize, ModelStatic } from 'sequelize';

interface SystemLogAttributes {
  id?: number;
  userId?: number;
  action: string; 
  target?: string; 
  targetId?: number; 
  details?: string; 
  ipAddress?: string;
  userAgent?: string; 
  status: 'success' | 'failed'; 
  timestamp?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface SystemLogInstance extends Model<SystemLogAttributes>, SystemLogAttributes {}

module.exports = (sequelize: Sequelize): ModelStatic<SystemLogInstance> => {
  const SystemLog = sequelize.define<SystemLogInstance>(
    'SystemLog',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        comment: 'User who performed the action'
      },
      action: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Type of action performed'
      },
      target: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'Resource type being affected (waste_post, collection, user, etc.)'
      },
      targetId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID of the affected resource'
      },
      details: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Additional details in JSON format'
      },
      ipAddress: {
        type: DataTypes.STRING(45),
        allowNull: true,
        comment: 'IP address of the request'
      },
      userAgent: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'User agent / browser info'
      },
      status: {
        type: DataTypes.ENUM('success', 'failed'),
        allowNull: false,
        defaultValue: 'success',
        comment: 'Status of the action'
      },
      timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: 'When the action occurred'
      }
    },
    {
      tableName: 'system_logs',
      timestamps: true,
      indexes: [
        { fields: ['userId'] },
        { fields: ['action'] },
        { fields: ['target', 'targetId'] },
        { fields: ['timestamp'] },
        { fields: ['createdAt'] }
      ]
    }
  );

  return SystemLog;
};
