module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableExists = await queryInterface.tableExists('collections');
    if (tableExists) {

      return;
    }

    await queryInterface.createTable('collections', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      postId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'waste_posts',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      recyclerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      businessId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      requestDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      scheduledDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('pending', 'requested', 'approved', 'scheduled', 'completed', 'confirmed', 'rejected', 'cancelled', 'expired'),
        allowNull: false,
        defaultValue: 'pending'
      },
      confirmedBy: {
        type: Sequelize.ENUM('recycler', 'business'),
        allowNull: true
      },
      completedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('collections', ['postId']);
    await queryInterface.addIndex('collections', ['recyclerId']);
    await queryInterface.addIndex('collections', ['businessId']);
    await queryInterface.addIndex('collections', ['status']);
    await queryInterface.addIndex('collections', ['requestDate']);
    await queryInterface.addIndex('collections', ['scheduledDate']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('collections');
  }
};
