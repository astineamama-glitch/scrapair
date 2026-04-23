import { DataTypes, Model, Sequelize, ModelStatic } from 'sequelize';

interface RatingHistoryAttributes {
  id?: number;
  userId: number;
  previousRating: number;
  newRating: number;
  changedBy?: number;
  reason: 'report_valid' | 'report_invalid_reversed' | 'feedback_update' | 'manual_admin_adjustment' | 'system_recalculation';
  sourceId?: number;
  sourceType?: 'report' | 'feedback' | 'admin';
  adminNotes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface RatingHistoryInstance 
  extends Model<RatingHistoryAttributes>, RatingHistoryAttributes {}

module.exports = (sequelize: Sequelize): ModelStatic<RatingHistoryInstance> => {
  const RatingHistory = sequelize.define<RatingHistoryInstance>(
    'RatingHistory',
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
        comment: 'User whose rating was modified'
      },
      previousRating: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
          min: 0,
          max: 5
        },
        comment: 'Rating before this change'
      },
      newRating: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
          min: 0,
          max: 5
        },
        comment: 'Rating after this change'
      },
      changedBy: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'admin_users',
          key: 'id'
        },
        onDelete: 'SET NULL',
        comment: 'Admin who made this change (null for system changes)'
      },
      reason: {
        type: DataTypes.ENUM(
          'report_valid',
          'report_invalid_reversed',
          'feedback_update',
          'manual_admin_adjustment',
          'system_recalculation'
        ),
        allowNull: false,
        comment: 'Reason for the rating change'
      },
      sourceId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID of the report/feedback that triggered this change'
      },
      sourceType: {
        type: DataTypes.ENUM('report', 'feedback', 'admin'),
        allowNull: true,
        comment: 'Type of source that triggered this change'
      },
      adminNotes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Admin comments about this change'
      }
    },
    {
      tableName: 'rating_history',
      timestamps: true,
      indexes: [
        { fields: ['userId'] },
        { fields: ['reason'] },
        { fields: ['sourceId'] },
        { fields: ['createdAt'] }
      ]
    }
  );

  (RatingHistory as any).associate = (models: any) => {
    RatingHistory.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    RatingHistory.belongsTo(models.AdminUser, { foreignKey: 'changedBy', as: 'admin' });
  };

  return RatingHistory;
};
