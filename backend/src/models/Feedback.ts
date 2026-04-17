import { DataTypes, Model, Sequelize, ModelStatic } from 'sequelize';

interface FeedbackAttributes {
  id?: number;
  collectionId: number;
  fromUserId: number; 
  toUserId: number; 
  rating: number; 
  comment?: string;
  type?: 'positive' | 'negative' | 'neutral'; 
  createdAt?: Date;
  updatedAt?: Date;
}

interface FeedbackInstance extends Model<FeedbackAttributes>, FeedbackAttributes {}

module.exports = (sequelize: Sequelize): ModelStatic<FeedbackInstance> => {
  const Feedback = sequelize.define<FeedbackInstance>(
    'Feedback',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      collectionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'collections',
          key: 'id'
        },
        comment: 'Collection associated with this feedback'
      },
      fromUserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        comment: 'User giving the feedback'
      },
      toUserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        comment: 'User receiving the feedback'
      },
      rating: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
          min: 1,
          max: 5
        },
        comment: 'Rating from 1-5 stars'
      },
      comment: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Feedback comment'
      },
      type: {
        type: DataTypes.ENUM('positive', 'negative', 'neutral'),
        allowNull: true,
        comment: 'Type of feedback'
      }
    },
    {
      tableName: 'feedbacks',
      timestamps: true,
      indexes: [
        { fields: ['collectionId'] },
        { fields: ['fromUserId'] },
        { fields: ['toUserId'] },
        { fields: ['createdAt'] }
      ]
    }
  );


  (Feedback as any).associate = (models: any) => {
    Feedback.belongsTo(models.Collection, { foreignKey: 'collectionId', as: 'collection' });
    Feedback.belongsTo(models.User, { foreignKey: 'fromUserId', as: 'fromUser' });
    Feedback.belongsTo(models.User, { foreignKey: 'toUserId', as: 'toUser' });
  };

  return Feedback;
};
