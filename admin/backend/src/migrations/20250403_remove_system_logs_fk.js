'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Remove the foreign key constraint on userId
    await queryInterface.removeConstraint('system_logs', 'system_logs_userId_fkey');
    
    // Modify the userId column to be standalone (no foreign key to users table)
    // Since admin actions are performed by admin users, not regular users
    // So we don't need the foreign key constraint
  },

  down: async (queryInterface, Sequelize) => {
    // In rollback, we can re-add the foreign key if needed
    // But for now, just leave it as is
  }
};
