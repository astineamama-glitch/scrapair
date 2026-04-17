module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      const columns = await queryInterface.describeTable('users');
      
      if (columns.passwordHistory) {

        return;
      }

      await queryInterface.addColumn('users', 'passwordHistory', {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'JSON array of last 5 hashed passwords for reuse prevention'
      });
    } catch (error) {
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeColumn('users', 'passwordHistory');
    } catch (error) {
      throw error;
    }
  }
};
