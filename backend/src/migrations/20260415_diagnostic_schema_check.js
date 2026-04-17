'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log('\n=== DIAGNOSTIC: Collections table uses VARCHAR for status, not ENUM ===');
    console.log('Status column type: CHARACTER VARYING(50)');
    console.log('This means all status values are already supported!\n');
    return;
  },

  down: async (queryInterface, Sequelize) => {
    return;
  }
};
