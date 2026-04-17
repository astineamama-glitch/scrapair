'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('collections', 'requestDate', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'ISO string format to avoid Sequelize timezone conversion'
    });

    await queryInterface.changeColumn('collections', 'scheduledDate', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'ISO string format to avoid Sequelize timezone conversion'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('collections', 'requestDate', {
      type: Sequelize.DATE,
      allowNull: true
    });

    await queryInterface.changeColumn('collections', 'scheduledDate', {
      type: Sequelize.DATE,
      allowNull: true
    });
  }
};
