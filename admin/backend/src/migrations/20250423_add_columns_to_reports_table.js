'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add missing columns to reports table if they don't exist
    const tableDescription = await queryInterface.describeTable('reports');
    
    if (!tableDescription.severity) {
      await queryInterface.addColumn('reports', 'severity', {
        type: Sequelize.ENUM('low', 'medium', 'high', 'critical'),
        allowNull: true,
        comment: 'Severity level of the report'
      });
    }

    if (!tableDescription.adminNotes) {
      await queryInterface.addColumn('reports', 'adminNotes', {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Notes from admin review'
      });
    }

    if (!tableDescription.pointsDeducted) {
      await queryInterface.addColumn('reports', 'pointsDeducted', {
        type: Sequelize.DECIMAL(3, 2),
        defaultValue: 0,
        allowNull: true,
        comment: 'Rating points deducted from user'
      });
    }

    if (!tableDescription.approvedBy) {
      await queryInterface.addColumn('reports', 'approvedBy', {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'admin_users',
          key: 'id'
        },
        onDelete: 'SET NULL',
        comment: 'Admin who reviewed/approved the report'
      });
    }

    if (!tableDescription.approvedAt) {
      await queryInterface.addColumn('reports', 'approvedAt', {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'When the report was approved/rejected'
      });
    }

    if (!tableDescription.rejectionReason) {
      await queryInterface.addColumn('reports', 'rejectionReason', {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Reason for rejecting the report'
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Revert changes
    const tableDescription = await queryInterface.describeTable('reports');
    
    if (tableDescription.severity) {
      await queryInterface.removeColumn('reports', 'severity');
    }
    if (tableDescription.adminNotes) {
      await queryInterface.removeColumn('reports', 'adminNotes');
    }
    if (tableDescription.pointsDeducted) {
      await queryInterface.removeColumn('reports', 'pointsDeducted');
    }
    if (tableDescription.approvedBy) {
      await queryInterface.removeColumn('reports', 'approvedBy');
    }
    if (tableDescription.approvedAt) {
      await queryInterface.removeColumn('reports', 'approvedAt');
    }
    if (tableDescription.rejectionReason) {
      await queryInterface.removeColumn('reports', 'rejectionReason');
    }
  }
};
