import { DataTypes, Model, Sequelize, ModelStatic } from 'sequelize';

interface WasteCategoryAttributes {
  id?: number;
  name: string;
  description?: string;
  icon?: string; 
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface WasteCategoryInstance extends Model<WasteCategoryAttributes>, WasteCategoryAttributes {}

module.exports = (sequelize: Sequelize): ModelStatic<WasteCategoryInstance> => {
  const WasteCategory = sequelize.define<WasteCategoryInstance>(
    'WasteCategory',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        comment: 'Category name (e.g., Plastic, Metal, Electronics)'
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Description of this waste category'
      },
      icon: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'Icon or emoji representing the category'
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Whether this category is available for use'
      }
    },
    {
      tableName: 'waste_categories',
      timestamps: true,
      indexes: [
        { fields: ['name'] },
        { fields: ['isActive'] }
      ]
    }
  );

  return WasteCategory;
};
