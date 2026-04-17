module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableExists = await queryInterface.tableExists('users');
    if (tableExists) {

      return;
    }

    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      type: {
        type: Sequelize.ENUM('business', 'recycler'),
        allowNull: false,
        comment: 'User type: business owner or recycler'
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      businessName: {
        type: Sequelize.STRING(150),
        allowNull: true,
        comment: 'For business users'
      },
      companyName: {
        type: Sequelize.STRING(150),
        allowNull: true,
        comment: 'For recycler users'
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      specialization: {
        type: Sequelize.STRING(200),
        allowNull: true,
        comment: 'For recycler users - what they specialize in'
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    await queryInterface.addIndex('users', ['email']);
    await queryInterface.addIndex('users', ['type']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('users');
  }
};
