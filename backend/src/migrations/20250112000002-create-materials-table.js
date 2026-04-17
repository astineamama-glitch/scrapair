module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableExists = await queryInterface.tableExists('materials');
    if (tableExists) {

      return;
    }

    await queryInterface.createTable('materials', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      businessUserId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE',
        comment: 'Reference to the business user who posted this material'
      },
      materialType: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Type of material (e.g., Bronze, Copper, Plastic, etc.)'
      },
      quantity: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Quantity of the material'
      },
      unit: {
        type: Sequelize.STRING(50),
        defaultValue: 'kg',
        comment: 'Unit of measurement (kg, lbs, pieces, etc.)'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Detailed description of the material'
      },
      contactEmail: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('available', 'reserved', 'sold'),
        defaultValue: 'available',
        comment: 'Current status of the material post'
      },
      isRecommendedForArtists: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: 'Whether this material is recommended for artists'
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

    await queryInterface.addIndex('materials', ['businessUserId']);
    await queryInterface.addIndex('materials', ['materialType']);
    await queryInterface.addIndex('materials', ['status']);
    await queryInterface.addIndex('materials', ['isRecommendedForArtists']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('materials');
  }
};
