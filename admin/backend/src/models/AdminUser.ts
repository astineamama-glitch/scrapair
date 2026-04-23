import { DataTypes, Model, Sequelize, ModelStatic } from 'sequelize';
import bcryptjs from 'bcryptjs';

interface AdminUserAttributes {
  id?: string;
  username: string;
  password: string;
  email?: string;
  role?: 'ADMIN' | 'SUPER_ADMIN';
  isActive?: boolean;
  lastLogin?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AdminUserInstance extends Model<AdminUserAttributes>, AdminUserAttributes {
  verifyPassword(password: string): Promise<boolean>;
}

module.exports = (sequelize: Sequelize): ModelStatic<AdminUserInstance> => {
  const AdminUser = sequelize.define<AdminUserInstance>(
    'AdminUser',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      username: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: true,
        unique: true,
        validate: {
          isEmail: true
        }
      },
      role: {
        type: DataTypes.ENUM('ADMIN', 'SUPER_ADMIN'),
        defaultValue: 'ADMIN',
        comment: 'Admin role level'
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      lastLogin: {
        type: DataTypes.DATE,
        allowNull: true
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
      tableName: 'admin_users',
      timestamps: true,
      indexes: [
        {
          fields: ['username']
        },
        {
          fields: ['email']
        }
      ]
    }
  ) as any;

  // Hash password before saving
  AdminUser.beforeCreate(async (user: AdminUserInstance) => {
    if (user.password) {
      user.password = await bcryptjs.hash(user.password, 10);
    }
  });

  AdminUser.beforeUpdate(async (user: AdminUserInstance) => {
    if (user.changed('password')) {
      user.password = await bcryptjs.hash(user.password, 10);
    }
  });

  // Method to verify password
  AdminUser.prototype.verifyPassword = async function (this: any, password: string): Promise<boolean> {
    return bcryptjs.compare(password, this.password);
  };

  return AdminUser as unknown as ModelStatic<AdminUserInstance>;
};
