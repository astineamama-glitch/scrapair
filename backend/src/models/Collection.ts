import { DataTypes, Model, Sequelize, ModelStatic } from 'sequelize';

interface CollectionAttributes {
  id?: number;
  postId: number;
  recyclerId: number;
  businessId: number;
  requestDate?: string;
  scheduledDate?: string;
  status?: 'pending' | 'requested' | 'approved' | 'scheduled' | 'completed' | 'confirmed' | 'rejected' | 'cancelled' | 'expired';
  confirmedBy?: 'recycler' | 'business';
  completedAt?: Date;
  transactionCode?: string;
  rejectionCount?: number;
  cancellationCount?: number;
  cancellationReason?: 'SCHEDULE_TOO_LONG' | 'TIME_CONFLICT' | 'RECYCLER_UNAVAILABLE' | 'OTHER';
  previousCollectionId?: number;
  isRetry?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CollectionInstance extends Model<CollectionAttributes>, CollectionAttributes {}

module.exports = (sequelize: Sequelize): ModelStatic<CollectionInstance> => {
  const Collection = sequelize.define<CollectionInstance>(
    'Collection',
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
        comment: 'Reference to the waste post being collected'
      },
      recyclerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        comment: 'Reference to the recycler user requesting collection'
      },
      businessId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        comment: 'Reference to the business user posting the waste'
      },
      requestDate: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'ISO string - Date when recycler requested the collection'
      },
      scheduledDate: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'ISO string - Date scheduled for the collection'
      },
      status: {
        type: DataTypes.ENUM('pending', 'requested', 'approved', 'scheduled', 'completed', 'confirmed', 'rejected', 'cancelled', 'expired'),
        allowNull: false,
        defaultValue: 'pending',
        comment: 'Status of the collection request'
      },
      confirmedBy: {
        type: DataTypes.ENUM('recycler', 'business'),
        allowNull: true,
        comment: 'Who confirmed the completed collection'
      },
      completedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Date when the collection was completed'
      },
      transactionCode: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
        comment: 'Unique transaction code format: COLL-YYYYMMDD-NNN'
      },
      rejectionCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Counter for rejections by business on this recycler for this post'
      },
      cancellationCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Counter for cancellations by recycler on this post (cumulative, never resets)'
      },
      cancellationReason: {
        type: DataTypes.ENUM('SCHEDULE_TOO_LONG', 'TIME_CONFLICT', 'RECYCLER_UNAVAILABLE', 'OTHER'),
        allowNull: true,
        comment: 'Reason provided by business when cancelling collection'
      },
      previousCollectionId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'collections',
          key: 'id'
        },
        comment: 'Reference to previous collection if this is a retry'
      },
      isRetry: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Flag indicating if this is a retry request after cancellation/rejection'
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
      timestamps: true,
      tableName: 'collections',
      indexes: [
        { fields: ['postId'] },
        { fields: ['recyclerId'] },
        { fields: ['businessId'] },
        { fields: ['status'] },
        { fields: ['requestDate'] },
        { fields: ['scheduledDate'] },
        { fields: ['transactionCode'] }
      ]
    }
  );

  // Associations
  (Collection as any).associate = (models: any) => {
    Collection.belongsTo(models.WastePost, {
      foreignKey: 'postId',
      as: 'post'
    });
    Collection.belongsTo(models.User, {
      foreignKey: 'recyclerId',
      as: 'recycler'
    });
    Collection.belongsTo(models.User, {
      foreignKey: 'businessId',
      as: 'business'
    });
  };

  return Collection;
};
