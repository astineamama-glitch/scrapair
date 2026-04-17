'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      const userTable = await queryInterface.describeTable('users').catch(() => ({}));

      const requiredColumns = {
        verificationCode: {
          type: Sequelize.STRING(10),
          allowNull: true
        },
        verificationCodeExpiry: {
          type: Sequelize.DATE,
          allowNull: true
        },
        resetToken: {
          type: Sequelize.STRING(255),
          allowNull: true
        },
        resetTokenExpiry: {
          type: Sequelize.DATE,
          allowNull: true
        },
        lastLoginAttempt: {
          type: Sequelize.DATE,
          allowNull: true
        },
        loginAttempts: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
          allowNull: true
        },
        isLocked: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
          allowNull: true
        },
        lockedUntil: {
          type: Sequelize.DATE,
          allowNull: true
        },
        subscriptionStatus: {
          type: Sequelize.ENUM('none', 'pending', 'active'),
          defaultValue: 'none',
          allowNull: true
        },
        dailyPostCount: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
          allowNull: true
        },
        dailyViewCount: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
          allowNull: true
        },
        lastPostDate: {
          type: Sequelize.DATEONLY,
          allowNull: true
        },
        lastViewDate: {
          type: Sequelize.DATEONLY,
          allowNull: true
        }
      };

      for (const [columnName, columnDef] of Object.entries(requiredColumns)) {
        const columnExists = userTable[columnName];
        if (!columnExists) {
          console.log(`Adding missing column: ${columnName}`);
          await queryInterface.addColumn('users', columnName, columnDef);
        }
      }

      console.log('Migration completed successfully');
    } catch (error) {
      console.error('Migration error:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      const userTable = await queryInterface.describeTable('users').catch(() => ({}));
      const columnsToRemove = [
        'verificationCode', 'verificationCodeExpiry', 'resetToken', 'resetTokenExpiry',
        'lastLoginAttempt', 'loginAttempts', 'isLocked', 'lockedUntil',
        'subscriptionStatus', 'dailyPostCount', 'dailyViewCount', 'lastPostDate', 'lastViewDate'
      ];

      for (const columnName of columnsToRemove) {
        if (userTable[columnName]) {
          console.log(`Removing column: ${columnName}`);
          await queryInterface.removeColumn('users', columnName);
        }
      }

      console.log('Migration rollback completed successfully');
    } catch (error) {
      console.error('Migration rollback error:', error);
      throw error;
    }
  }
};
