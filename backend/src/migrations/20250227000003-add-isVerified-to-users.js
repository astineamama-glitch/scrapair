module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      const columns = await queryInterface.describeTable('users');
      if (columns.isVerified) {

        return;
      }
      await queryInterface.addColumn('users', 'isVerified', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        comment: 'Whether the user has been verified by admin'
      });

      console.log('✓ Added isVerified column to users table');
    } catch (error) {
      console.error('Migration error:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeColumn('users', 'isVerified');
    } catch (error) {
      throw error;
    }
  }
};
