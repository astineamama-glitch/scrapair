import { DataTypes, Model, Sequelize, ModelStatic } from 'sequelize';

interface SubscriptionAttributes {
  id?: number;
  userId: number;
  userType: 'business' | 'recycler';
  status: 'pending' | 'active' | 'expired' | 'rejected';
  paymentReference?: string;
  extraItemsPerDay: number;
  requestedAt?: Date;
  approvedAt?: Date;
  approvedBy?: number;
  rejectionReason?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface SubscriptionInstance extends Model<SubscriptionAttributes>, SubscriptionAttributes {}

module.exports = (sequelize: Sequelize): ModelStatic<SubscriptionInstance> => {
  const Subscription = sequelize.define<SubscriptionInstance>(
    'Subscription',
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
        },
        comment: 'User who requested the subscription'
      },
      userType: {
        type: DataTypes.ENUM('business', 'recycler'),
        allowNull: false,
        comment: 'Type of user requesting subscription'
      },
      status: {
        type: DataTypes.ENUM('pending', 'active', 'expired', 'rejected'),
        defaultValue: 'pending',
        allowNull: false,
        comment: 'Current subscription status'
      },
      paymentReference: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'GCash reference number or payment proof'
      },
      extraItemsPerDay: {
        type: DataTypes.INTEGER,
        defaultValue: 10,
        comment: 'Additional items per day granted by subscription'
      },
      requestedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        comment: 'When subscription was requested'
      },
      approvedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'When admin approved the subscription'
      },
      approvedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Admin who approved/rejected'
      },
      rejectionReason: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: 'Reason for rejection if rejected'
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
      tableName: 'subscriptions',
      timestamps: true,
      indexes: [
        { fields: ['userId'] },
        { fields: ['status'] },
        { fields: ['userType'] },
        { fields: ['requestedAt'] }
      ]
    }
  );

  return Subscription as unknown as ModelStatic<SubscriptionInstance>;
};
