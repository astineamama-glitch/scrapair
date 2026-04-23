import { DataTypes, Model, Sequelize, ModelStatic } from 'sequelize';

interface RatingDeductionRuleAttributes {
  id?: number;
  reason: string;
  severityLevel: 'low' | 'medium' | 'high' | 'critical';
  defaultDeductionPercentage: number;
  description?: string;
  minDeduction?: number;
  maxDeduction?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface RatingDeductionRuleInstance 
  extends Model<RatingDeductionRuleAttributes>, RatingDeductionRuleAttributes {}

module.exports = (sequelize: Sequelize): ModelStatic<RatingDeductionRuleInstance> => {
  const RatingDeductionRule = sequelize.define<RatingDeductionRuleInstance>(
    'RatingDeductionRule',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
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
        unique: true,
        comment: 'Report reason that this rule applies to'
      },
      severityLevel: {
        type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
        allowNull: false,
        comment: 'Severity classification of this reason'
      },
      defaultDeductionPercentage: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
          min: 0,
          max: 100
        },
        comment: 'Default percentage to deduct from rating (0-100)'
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Description of this deduction rule'
      },
      minDeduction: {
        type: DataTypes.FLOAT,
        allowNull: true,
        validate: {
          min: 0,
          max: 5
        },
        comment: 'Minimum rating points that can be deducted (e.g., 0.2)'
      },
      maxDeduction: {
        type: DataTypes.FLOAT,
        allowNull: true,
        validate: {
          min: 0,
          max: 5
        },
        comment: 'Maximum rating points that can be deducted (e.g., 1.5)'
      }
    },
    {
      tableName: 'rating_deduction_rules',
      timestamps: true,
      indexes: [
        { fields: ['reason'] },
        { fields: ['severityLevel'] }
      ]
    }
  );

  return RatingDeductionRule;
};
