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
        comment: 'Whether the user has been verified by admin'
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
        }
      ]
    }
  ) as any;

  // Hash password before saving
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

  // Method to verify password
  User.prototype.verifyPassword = async function (this: any, password: string): Promise<boolean> {
    return bcryptjs.compare(password, this.password);
  };

  // Association with Materials
  (User as any).associate = (models: any) => {
    User.hasMany(models.Material, {
      foreignKey: 'businessUserId',
      as: 'materials'
    });
  };

  return User as unknown as ModelStatic<UserInstance>;
};
