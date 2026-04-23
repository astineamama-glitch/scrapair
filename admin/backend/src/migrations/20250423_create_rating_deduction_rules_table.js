'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('rating_deduction_rules', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      reason: {
        type: Sequelize.ENUM('poor_quality', 'late_pickup', 'damaged_materials', 'incomplete_delivery', 'bad_behavior', 'other'),
        allowNull: false,
        unique: true
      },
      severityLevel: {
        type: Sequelize.ENUM('low', 'medium', 'high', 'critical'),
        allowNull: false
      },
      defaultDeductionPercentage: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: { min: 0, max: 100 }
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      minDeduction: {
        type: Sequelize.DECIMAL(3, 2),
        defaultValue: 0.0,
        allowNull: true
      },
      maxDeduction: {
        type: Sequelize.DECIMAL(3, 2),
        defaultValue: 5.0,
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
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('rating_deduction_rules');
  }
};
