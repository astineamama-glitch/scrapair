import { DataTypes, Model, Sequelize, ModelStatic } from 'sequelize';
import bcryptjs from 'bcryptjs';

interface UserAttributes {
  id?: number;
  type: 'business' | 'recycler';
  email: string;
  password: string;
  businessName?: string;
  companyName?: string;
  phone: string;
  specialization?: string;
  isActive?: boolean;
  isVerified?: boolean;
  verificationCode?: string;
  verificationCodeExpiry?: Date;
  resetToken?: string;
  resetTokenExpiry?: Date;
  passwordHistory?: string; // JSON array of last 5 hashed passwords
  lastLoginAttempt?: Date;
  loginAttempts?: number;
  isLocked?: boolean;
  lockedUntil?: Date;
  subscriptionStatus?: 'none' | 'pending' | 'active';
  dailyPostCount?: number;
  dailyViewCount?: number;
  lastPostDate?: string;
  lastViewDate?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserInstance extends Model<UserAttributes>, UserAttributes {
  verifyPassword(password: string): Promise<boolean>;
}

module.exports = (sequelize: Sequelize): ModelStatic<UserInstance> => {
  const User = sequelize.define<UserInstance>(
    'User',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      type: {
        type: DataTypes.ENUM('business', 'recycler'),
        allowNull: false,
        comment: 'User type: business owner or recycler'
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true
        }
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      businessName: {
        type: DataTypes.STRING(150),
        allowNull: true,
        comment: 'For business users'
      },
      companyName: {
        type: DataTypes.STRING(150),
        allowNull: true,
        comment: 'For recycler users'
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: false,
        validate: {
          is: /^[\d\s\-\+\(\)]+$/
        }
      },
      specialization: {
        type: DataTypes.STRING(200),
        allowNull: true,
        comment: 'For recycler users - what they specialize in (Metals, Plastics, etc.)'
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'User has verified their email'
      },
      verificationCode: {
        type: DataTypes.STRING(10),
        allowNull: true,
        comment: '6-digit verification code'
      },
      verificationCodeExpiry: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'When verification code expires'
      },
      resetToken: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Hashed password reset token'
      },
      resetTokenExpiry: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'When password reset token expires'
      },
      passwordHistory: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'JSON array of last 5 hashed passwords for reuse prevention'
      },
      lastLoginAttempt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Timestamp of last login attempt'
      },
      loginAttempts: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: 'Number of failed login attempts'
      },
      isLocked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Account temporarily locked due to failed attempts'
      },
      lockedUntil: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'When account lock expires'
      },
      subscriptionStatus: {
        type: DataTypes.ENUM('none', 'pending', 'active'),
        defaultValue: 'none',
        comment: 'Subscription status for daily limit extension'
      },
      dailyPostCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: 'Number of posts created today (business owners)'
      },
      dailyViewCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: 'Number of detail views today (recyclers)'
      },
      lastPostDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: 'Date of last post count reset'
      },
      lastViewDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: 'Date of last view count reset'
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
      tableName: 'users',
      timestamps: true,
      indexes: [
        {
          fields: ['email']
        },
        {
          fields: ['type']
        },
        {
          fields: ['isVerified']
        },
        {
          fields: ['isLocked']
        }
      ]
    }
  ) as any;

  User.beforeCreate(async (user: UserInstance) => {
    if (user.password) {
      user.password = await bcryptjs.hash(user.password, 10);
    }
  });

  User.beforeUpdate(async (user: UserInstance) => {
    if (user.changed('password')) {
      user.password = await bcryptjs.hash(user.password, 10);
    }
  });

  User.prototype.verifyPassword = async function (this: any, password: string): Promise<boolean> {
    return bcryptjs.compare(password, this.password);
  };

  (User as any).associate = (models: any) => {
    User.hasMany(models.Material, {
      foreignKey: 'businessUserId',
      as: 'materials'
    });

    User.hasMany(models.WastePost, {
      foreignKey: 'businessId',
      as: 'wastePostsAsOwner'
    });

    User.hasMany(models.WastePost, {
      foreignKey: 'approvedRecyclerId',
      as: 'wastePostsAsRecycler'
    });
  };

  return User as unknown as ModelStatic<UserInstance>;
};
