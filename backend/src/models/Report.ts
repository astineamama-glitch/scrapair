import { DataTypes, Model, Sequelize, ModelStatic } from 'sequelize';

interface ReportAttributes {
  id?: number;
  reporterId: number; 
  reportedUserId: number; 
  collectionId?: number; 
  postId?: number; 
  reason: string; 
  description: string; 
  isValid?: boolean;
  validityScore?: number; 
  pointsDeducted?: number; 
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: number; 
  approvedAt?: Date;
  rejectionReason?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ReportInstance extends Model<ReportAttributes>, ReportAttributes {}

module.exports = (sequelize: Sequelize): ModelStatic<ReportInstance> => {
  const Report = sequelize.define<ReportInstance>(
    'Report',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      reporterId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        comment: 'User submitting the report'
      },
      reportedUserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        comment: 'User being reported'
      },
      collectionId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'collections',
          key: 'id'
        },
        comment: 'Associated collection'
      },
      postId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'waste_posts',
          key: 'id'
        },
        comment: 'Associated waste post'
      },
      reason: {
        type: DataTypes.ENUM(
          'poor_quality',
          'late_pickup',
          'damaged_materials',
          'incomplete_delivery',
          'bad_behavior',
          'other'
        ),
        allowNull: false,
        comment: 'Reason for report'
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'Detailed description of the issue'
      },
      isValid: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        comment: 'Admin determination of validity'
      },
      validityScore: {
        type: DataTypes.FLOAT,
        allowNull: true,
        validate: {
          min: 0,
          max: 1
        },
        comment: 'System-generated validity score (0-1)'
      },
      pointsDeducted: {
        type: DataTypes.FLOAT,
        allowNull: true,
        defaultValue: 0,
        comment: 'Rating points deducted (0.2-0.5)'
      },
      status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        allowNull: false,
        defaultValue: 'pending',
        comment: 'Status of the report'
      },
      approvedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        comment: 'Admin who approved/rejected'
      },
      approvedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'When the report was approved/rejected'
      },
      rejectionReason: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Reason for rejection'
      }
    },
    {
      tableName: 'reports',
      timestamps: true,
      indexes: [
        { fields: ['reporterId'] },
        { fields: ['reportedUserId'] },
        { fields: ['status'] },
        { fields: ['reason'] },
        { fields: ['createdAt'] }
      ]
    }
  );

  (Report as any).associate = (models: any) => {
    Report.belongsTo(models.User, { foreignKey: 'reporterId', as: 'reporter' });
    Report.belongsTo(models.User, { foreignKey: 'reportedUserId', as: 'reportedUser' });
    Report.belongsTo(models.User, { foreignKey: 'approvedBy', as: 'approver' });
    Report.belongsTo(models.Collection, { foreignKey: 'collectionId', as: 'collection' });
    Report.belongsTo(models.WastePost, { foreignKey: 'postId', as: 'post' });
  };

  return Report;
};
