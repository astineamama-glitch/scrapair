'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('system_logs', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
        comment: 'User who performed the action'
      },
      action: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Type of action performed'
      },
      target: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'Resource type being affected (waste_post, collection, user, etc.)'
      },
      targetId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'ID of the affected resource'
      },
      details: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Additional details in JSON format'
      },
      ipAddress: {
        type: Sequelize.STRING(45),
        allowNull: true,
        comment: 'IP address of the request'
      },
      userAgent: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'User agent / browser info'
      },
      status: {
        type: Sequelize.ENUM('success', 'failed'),
        allowNull: false,
        defaultValue: 'success',
        comment: 'Status of the action'
      },
      timestamp: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('now'),
        comment: 'When the action occurred'
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

    // Create indexes
    await queryInterface.addIndex('system_logs', ['userId']);
    await queryInterface.addIndex('system_logs', ['action']);
    await queryInterface.addIndex('system_logs', ['target', 'targetId']);
    await queryInterface.addIndex('system_logs', ['timestamp']);
    await queryInterface.addIndex('system_logs', ['createdAt']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('system_logs');
  }
};
