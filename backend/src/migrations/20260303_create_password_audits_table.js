module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      const tableExists = await queryInterface.tableExists('password_audits');
      if (tableExists) {

        return;
      }

      await queryInterface.createTable('password_audits', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        userId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          comment: 'Reference to user'
        },
        email: {
          type: Sequelize.STRING(100),
          allowNull: false,
          comment: 'Email of user for easier lookup'
        },
        type: {
          type: Sequelize.ENUM('business', 'recycler'),
          allowNull: false,
          comment: 'User type'
        },
        changeType: {
          type: Sequelize.ENUM('reset', 'change'),
          allowNull: false,
          comment: 'reset = forgot password flow, change = edit profile flow'
        },
        ipAddress: {
          type: Sequelize.STRING(50),
          allowNull: true,
          comment: 'IP address from which password was changed'
        },
        userAgent: {
          type: Sequelize.TEXT,
          allowNull: true,
          comment: 'Browser/device info'
        },
        status: {
          type: Sequelize.ENUM('success', 'failed'),
          allowNull: false,
          defaultValue: 'success',
          comment: 'Whether password change succeeded'
        },
        reason: {
          type: Sequelize.STRING(255),
          allowNull: true,
          comment: 'Reason for failure if applicable'
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW
        }
      });

      await queryInterface.addIndex('password_audits', ['userId']);
      await queryInterface.addIndex('password_audits', ['email']);
      await queryInterface.addIndex('password_audits', ['createdAt']);
      await queryInterface.addIndex('password_audits', ['ipAddress']);
      await queryInterface.addIndex('password_audits', ['changeType']);

      console.log('✓ Created password_audits table');
    } catch (error) {
      console.error('Migration error:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.dropTable('password_audits');
    } catch (error) {
      throw error;
    }
  }
};
