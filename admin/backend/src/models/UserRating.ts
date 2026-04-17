import { DataTypes, Model, Sequelize, ModelStatic } from 'sequelize';

interface UserRatingAttributes {
  id?: number;
  userId: number; 
  averageRating?: number; 
  totalRatings?: number; 
  totalFeedback?: number; 
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserRatingInstance extends Model<UserRatingAttributes>, UserRatingAttributes {}

module.exports = (sequelize: Sequelize): ModelStatic<UserRatingInstance> => {
  const UserRating = sequelize.define<UserRatingInstance>(
    'UserRating',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: 'users',
          key: 'id'
        },
        comment: 'User being rated'
      },
      averageRating: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 5.0,
        comment: 'Average rating of this user (starts at 5.0, decreases with valid reports)'
      },
      totalRatings: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Total number of ratings received'
      },
      totalFeedback: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Total feedback comments received'
      }
    },
    {
      tableName: 'user_ratings',
      timestamps: true,
      indexes: [
        { fields: ['userId'] },
        { fields: ['averageRating'] }
      ]
    }
  );

  (UserRating as any).associate = (models: any) => {
    UserRating.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  };

  return UserRating;
};
