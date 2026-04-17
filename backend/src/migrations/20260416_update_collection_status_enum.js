'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log('\n=== Collections status column is VARCHAR - all values already supported ===');
    console.log('No migration needed for existing database.\n');
    // Collections status column is VARCHAR(50), not ENUM
    // This means it already supports all status values:
    // pending, requested, approved, scheduled, completed, confirmed, rejected, cancelled, expired
    return;
  },

  down: async (queryInterface, Sequelize) => {
    return;
  }
};
