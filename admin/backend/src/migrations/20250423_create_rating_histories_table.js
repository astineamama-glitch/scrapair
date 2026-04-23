'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('rating_history', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      previousRating: {
        type: Sequelize.DECIMAL(3, 2),
        allowNull: false
      },
      newRating: {
        type: Sequelize.DECIMAL(3, 2),
        allowNull: false
      },
      changedBy: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'admin_users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      reason: {
        type: Sequelize.ENUM('report_valid', 'report_invalid_reversed', 'feedback_update', 'manual_admin_adjustment', 'system_recalculation'),
        allowNull: false
      },
      sourceId: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      sourceType: {
        type: Sequelize.ENUM('report', 'feedback', 'manual', 'system'),
        allowNull: true
      },
      adminNotes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('now')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('now')
      }
    });

    // Add indexes for common queries
    await queryInterface.addIndex('rating_histories', ['userId']);
    await queryInterface.addIndex('rating_histories', ['createdAt']);
    await queryInterface.addIndex('rating_histories', ['userId', 'createdAt']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('rating_history');
  }
};
