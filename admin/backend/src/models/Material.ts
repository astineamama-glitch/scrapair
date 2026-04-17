import { DataTypes, Model, Sequelize, ModelStatic } from 'sequelize';

interface MaterialAttributes {
  id?: number;
  businessUserId: number;
  materialType: string;
  quantity: number;
  unit?: string;
  description?: string;
  contactEmail: string;
  status?: 'available' | 'reserved' | 'sold';
  isRecommendedForArtists?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface MaterialInstance extends Model<MaterialAttributes>, MaterialAttributes {}

module.exports = (sequelize: Sequelize): ModelStatic<MaterialInstance> => {
  const Material = sequelize.define<MaterialInstance>(
    'Material',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      businessUserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        comment: 'Reference to the business user who posted this material'
      },
      materialType: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Type of material (e.g., Bronze, Copper, Plastic, etc.)'
      },
      quantity: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Quantity of the material'
      },
      unit: {
        type: DataTypes.STRING(50),
        defaultValue: 'kg',
        comment: 'Unit of measurement (kg, lbs, pieces, etc.)'
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Detailed description of the material'
      },
      contactEmail: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          isEmail: true
        }
      },
      status: {
        type: DataTypes.ENUM('available', 'reserved', 'sold'),
        defaultValue: 'available',
        comment: 'Current status of the material post'
      },
      isRecommendedForArtists: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Whether this material is recommended for artists'
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
      tableName: 'materials',
      timestamps: true,
      indexes: [
        {
          fields: ['businessUserId']
        },
        {
          fields: ['materialType']
        },
        {
          fields: ['status']
        },
        {
          fields: ['isRecommendedForArtists']
        }
      ]
    }
  ) as any;

  (Material as any).associate = (models: any) => {
    Material.belongsTo(models.User, {
      foreignKey: 'businessUserId',
      as: 'business'
    });
  };

  return Material as unknown as ModelStatic<MaterialInstance>;
};
