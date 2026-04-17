import { DataTypes, Model, Sequelize, ModelStatic } from 'sequelize';

interface PostRatingAttributes {
  id?: number;
  postId: number; 
  averageRating?: number; 
  totalRatings?: number; 
  totalFeedback?: number; 
  createdAt?: Date;
  updatedAt?: Date;
}

interface PostRatingInstance extends Model<PostRatingAttributes>, PostRatingAttributes {}

module.exports = (sequelize: Sequelize): ModelStatic<PostRatingInstance> => {
  const PostRating = sequelize.define<PostRatingInstance>(
    'PostRating',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      postId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: 'waste_posts',
          key: 'id'
        },
        comment: 'Waste post being rated'
      },
      averageRating: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 5.0,
        comment: 'Average rating of this post (starts at 5.0, decreases with valid reports)'
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
      tableName: 'post_ratings',
      timestamps: true,
      indexes: [
        { fields: ['postId'] },
        { fields: ['averageRating'] }
      ]
    }
  );

  (PostRating as any).associate = (models: any) => {
    PostRating.belongsTo(models.WastePost, { foreignKey: 'postId', as: 'post' });
    models.WastePost.hasOne(PostRating, { foreignKey: 'postId', as: 'postRating' });
  };

  return PostRating;
};
