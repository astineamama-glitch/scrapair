import { DataTypes, Model, Sequelize, ModelStatic } from 'sequelize';

interface WastePostAttributes {
  id?: number;
  businessId: number;
  title: string;
  description: string;
  wasteType: string;
  quantity: number;
  unit: string;
  condition: 'poor' | 'fair' | 'good' | 'excellent';
  location: string;
  latitude: number;
  longitude: number;
  city: string;
  address: string;
  price?: number;
  images?: string[];
  status?: 'draft' | 'active' | 'in-collection' | 'collected';
  visibility?: 'private' | 'public';
  availabilityCount?: number;
  collectionStatus?: 'ACTIVE' | 'RESERVED' | 'PICKED_UP' | 'COMPLETED';
  approvedRecyclerId?: number | null;
  pickupDeadline?: Date | null;
  pickedUpAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface WastePostInstance extends Model<WastePostAttributes>, WastePostAttributes {}

module.exports = (sequelize: Sequelize): ModelStatic<WastePostInstance> => {
  const WastePost = sequelize.define<WastePostInstance>(
    'WastePost',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      businessId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        comment: 'Reference to the business user who posted this waste'
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Title of the waste post'
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'Detailed description of the waste material'
      },
      wasteType: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Type of waste (plastic, metal, paper, glass, electronics, etc.)'
      },
      quantity: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Quantity of waste material'
      },
      unit: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'kg',
        comment: 'Unit of measurement (kg, lbs, tons, pieces, etc.)'
      },
      condition: {
        type: DataTypes.ENUM('poor', 'fair', 'good', 'excellent'),
        allowNull: false,
        comment: 'Condition of the waste material'
      },
      location: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Physical location of the waste'
      },
      latitude: {
        type: DataTypes.DECIMAL(10, 8),
        allowNull: false,
        comment: 'Latitude coordinate for the business location'
      },
      longitude: {
        type: DataTypes.DECIMAL(11, 8),
        allowNull: false,
        comment: 'Longitude coordinate for the business location'
      },
      city: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'City where the waste is located'
      },
      address: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Full address of the waste location'
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Price of the waste material (optional, if being sold)'
      },
      images: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
        comment: 'Array of image URLs'
      },
      status: {
        type: DataTypes.ENUM('draft', 'active', 'in-collection', 'collected'),
        defaultValue: 'active',
        comment: 'Current status of the waste post (draft -> active -> in-collection -> collected)'
      },
      visibility: {
        type: DataTypes.ENUM('private', 'public'),
        defaultValue: 'public',
        comment: 'Whether the post is visible to public or private'
      },
      availabilityCount: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        comment: 'Number of items available for collection'
      },
      collectionStatus: {
        type: DataTypes.ENUM('ACTIVE', 'RESERVED', 'PICKED_UP', 'COMPLETED'),
        defaultValue: 'ACTIVE',
        comment: 'Collection workflow status: ACTIVE -> RESERVED -> PICKED_UP -> COMPLETED'
      },
      approvedRecyclerId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        comment: 'ID of the recycler approved to collect this waste'
      },
      pickupDeadline: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Deadline for recycler to pick up (1 hour after approval)'
      },
      pickedUpAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Timestamp when recycler marked as picked up'
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
      tableName: 'waste_posts',
      timestamps: true,
      indexes: [
        {
          fields: ['businessId']
        },
        {
          fields: ['status']
        },
        {
          fields: ['collectionStatus']
        },
        {
          fields: ['approvedRecyclerId']
        },
        {
          fields: ['pickupDeadline']
        },
        {
          fields: ['wasteType']
        },
        {
          fields: ['latitude', 'longitude']
        },
        {
          fields: ['createdAt']
        },
        {
          fields: ['visibility']
        }
      ]
    }
  );

  (WastePost as any).associate = (models: any) => {
    WastePost.belongsTo(models.User, {
      foreignKey: 'businessId',
      as: 'business'
    });
    
    WastePost.belongsTo(models.User, {
      foreignKey: 'approvedRecyclerId',
      as: 'approvedRecycler'
    });
  };

  return WastePost;
};
