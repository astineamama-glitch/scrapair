import { DataTypes, Model, Sequelize, ModelStatic } from 'sequelize';

interface ReviewAttributes {
  id?: number;
  businessId: number;
  reviewerId: number;
  postId?: number;
  rating: number; // 1-5
  comment?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ReviewInstance extends Model<ReviewAttributes>, ReviewAttributes {}

module.exports = (sequelize: Sequelize): ModelStatic<ReviewInstance> => {
  const Review = sequelize.define<ReviewInstance>(
    'Review',
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
        comment: 'Business being reviewed'
      },
      reviewerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        comment: 'User who left the review (recycler)'
      },
      postId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'waste_posts',
          key: 'id'
        },
        comment: 'Associated waste post (optional)'
      },
      rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 5
        },
        comment: 'Rating from 1 to 5'
      },
      comment: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Review comment'
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
      tableName: 'reviews',
      timestamps: true
    }
  );

  return Review;
};
