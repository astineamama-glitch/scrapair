import { DataTypes, Model, Sequelize, ModelStatic } from 'sequelize';

interface PasswordAuditAttributes {
  id?: number;
  userId: number;
  email: string;
  type: 'business' | 'recycler';
  changeType: 'reset' | 'change'; // 'reset' via forgot password, 'change' via profile
  ipAddress?: string;
  userAgent?: string;
  status: 'success' | 'failed';
  reason?: string; // Why it failed (if applicable)
  createdAt?: Date;
  updatedAt?: Date;
}

interface PasswordAuditInstance extends Model<PasswordAuditAttributes>, PasswordAuditAttributes {}

module.exports = (sequelize: Sequelize): ModelStatic<PasswordAuditInstance> => {
  const PasswordAudit = sequelize.define<PasswordAuditInstance>(
    'PasswordAudit',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Reference to user'
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Email of user for easier lookup'
      },
      type: {
        type: DataTypes.ENUM('business', 'recycler'),
        allowNull: false,
        comment: 'User type'
      },
      changeType: {
        type: DataTypes.ENUM('reset', 'change'),
        allowNull: false,
        comment: 'reset = forgot password flow, change = edit profile flow'
      },
      ipAddress: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'IP address from which password was changed'
      },
      userAgent: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Browser/device info'
      },
      status: {
        type: DataTypes.ENUM('success', 'failed'),
        allowNull: false,
        defaultValue: 'success',
        comment: 'Whether password change succeeded'
      },
      reason: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Reason for failure if applicable'
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
      tableName: 'password_audits',
      timestamps: true,
      indexes: [
        { fields: ['userId'] },
        { fields: ['email'] },
        { fields: ['createdAt'] },
        { fields: ['ipAddress'] },
        { fields: ['changeType'] }
      ]
    }
  ) as any;

  return PasswordAudit as unknown as ModelStatic<PasswordAuditInstance>;
};
