import { Sequelize } from 'sequelize';
import config from '../config/database';
import type { ConversationInstance } from './Conversation';
import type { MessageInstance } from './Message';
import type { NotificationInstance } from './Notification';

const env = (process.env.NODE_ENV || 'development') as keyof typeof config;
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    timezone: 'UTC' // Force all date handling to UTC - DO NOT APPLY LOCAL TIMEZONE CONVERSION
  }
);

const User = require('./User')(sequelize);
const Material = require('./Material')(sequelize);
const WastePost = require('./WastePost')(sequelize);
const Collection = require('./Collection')(sequelize);
const Review = require('./Review')(sequelize);
const PostMessage = require('./PostMessage')(sequelize);
const SystemLog = require('./SystemLog')(sequelize);
const WasteCategory = require('./WasteCategory')(sequelize);
const Feedback = require('./Feedback')(sequelize);
const UserRating = require('./UserRating')(sequelize);
const PostRating = require('./PostRating')(sequelize);
const Report = require('./Report')(sequelize);
const Conversation = require('./Conversation')(sequelize);
const Message = require('./Message')(sequelize);
const Notification = require('./Notification')(sequelize);
const PasswordAudit = require('./PasswordAudit')(sequelize);
const Subscription = require('./Subscription')(sequelize);


const models: any = {
  User,
  Material,
  WastePost,
  Collection,
  Conversation,
  Message,
  Notification,
  Review,
  PostMessage,
  SystemLog,
  WasteCategory,
  Feedback,
  UserRating,
  PostRating,
  Report,
  PasswordAudit,
  Subscription
};

Object.keys(models).forEach((key) => {
  if (models[key].associate) {
    models[key].associate(models);
  }
});

User.hasMany(Conversation, { foreignKey: 'participant1Id', as: 'conversationsAsP1' });
Conversation.belongsTo(User, { foreignKey: 'participant1Id', as: 'participant1' });

User.hasMany(Conversation, { foreignKey: 'participant2Id', as: 'conversationsAsP2' });
Conversation.belongsTo(User, { foreignKey: 'participant2Id', as: 'participant2' });

Conversation.hasMany(Message, { foreignKey: 'conversationId' });
Message.belongsTo(Conversation, { foreignKey: 'conversationId' });

User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });

User.hasMany(Message, { foreignKey: 'recipientId', as: 'receivedMessages' });
Message.belongsTo(User, { foreignKey: 'recipientId', as: 'recipient' });

User.hasMany(Notification, { foreignKey: 'userId' });
Notification.belongsTo(User, { foreignKey: 'userId' });

WastePost.hasMany(Conversation, { foreignKey: 'wastePostId' });
Conversation.belongsTo(WastePost, { foreignKey: 'wastePostId', as: 'wastePost' });

Review.belongsTo(User, { foreignKey: 'businessId', as: 'businessOwner' });
Review.belongsTo(User, { foreignKey: 'reviewerId', as: 'reviewer' });
Review.belongsTo(WastePost, { foreignKey: 'postId', as: 'post' });
User.hasMany(Review, { foreignKey: 'businessId', as: 'reviews' });

PostMessage.belongsTo(WastePost, { foreignKey: 'postId', as: 'post' });
PostMessage.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
PostMessage.belongsTo(User, { foreignKey: 'recipientId', as: 'recipient' });
WastePost.hasMany(PostMessage, { foreignKey: 'postId', as: 'messages' });
User.hasMany(PostMessage, { foreignKey: 'senderId', as: 'sentPostMessages' });
User.hasMany(PostMessage, { foreignKey: 'recipientId', as: 'receivedPostMessages' });

SystemLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(SystemLog, { foreignKey: 'userId', as: 'systemLogs' });

Collection.hasMany(Feedback, { foreignKey: 'collectionId', as: 'feedbacks' });
User.hasMany(Feedback, { foreignKey: 'fromUserId', as: 'feedbackGiven' });
User.hasMany(Feedback, { foreignKey: 'toUserId', as: 'feedbackReceived' });

User.hasMany(Report, { foreignKey: 'reporterId', as: 'reportsSubmitted' });
User.hasMany(Report, { foreignKey: 'reportedUserId', as: 'reportsReceived' });
User.hasMany(Report, { foreignKey: 'approvedBy', as: 'reportsApproved' });

PasswordAudit.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(PasswordAudit, { foreignKey: 'userId', as: 'passwordAudits' });

Subscription.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Subscription, { foreignKey: 'userId', as: 'subscriptions' });


export { sequelize, User, Material, WastePost, Collection, Conversation, Message, Notification, Review, PostMessage, SystemLog, WasteCategory, Feedback, UserRating, PostRating, Report, PasswordAudit, Subscription };
export type { ConversationInstance, MessageInstance, NotificationInstance };
export default models;
