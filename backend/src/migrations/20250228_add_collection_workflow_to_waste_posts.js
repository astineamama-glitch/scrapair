module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableExists = await queryInterface.tableExists('waste_posts');
    
    if (!tableExists) {

      return;
    }

    const table = await queryInterface.describeTable('waste_posts');
    
    const newColumns = [];
    
    if (!table.collectionStatus) {
      newColumns.push('collectionStatus');
    }
    if (!table.approvedRecyclerId) {
      newColumns.push('approvedRecyclerId');
    }
    if (!table.pickupDeadline) {
      newColumns.push('pickupDeadline');
    }
    if (!table.pickedUpAt) {
      newColumns.push('pickedUpAt');
    }

    if (newColumns.length === 0) {
      return;
    }
    if (!table.collectionStatus) {
      await queryInterface.addColumn('waste_posts', 'collectionStatus', {
        type: Sequelize.ENUM('ACTIVE', 'APPROVED', 'PICKED_UP', 'COMPLETED'),
        defaultValue: 'ACTIVE',
        comment: 'Collection workflow status: ACTIVE -> APPROVED -> PICKED_UP -> COMPLETED'
      });
    }
    if (!table.approvedRecyclerId) {
      await queryInterface.addColumn('waste_posts', 'approvedRecyclerId', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        comment: 'ID of the recycler approved to collect this waste'
      });
    }
    if (!table.pickupDeadline) {
      await queryInterface.addColumn('waste_posts', 'pickupDeadline', {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Deadline for recycler to pick up (1 hour after approval)'
      });
    }
    if (!table.pickedUpAt) {
      await queryInterface.addColumn('waste_posts', 'pickedUpAt', {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Timestamp when recycler marked as picked up'
      });
    }
    try {
      const indexes = await queryInterface.showIndex('waste_posts');
      const indexNames = indexes.map(idx => idx.name);

      if (!indexNames.includes('waste_posts_collectionStatus')) {
        await queryInterface.addIndex('waste_posts', ['collectionStatus'], {
          name: 'waste_posts_collectionStatus'
        });
      }

      if (!indexNames.includes('waste_posts_approvedRecyclerId')) {
        await queryInterface.addIndex('waste_posts', ['approvedRecyclerId'], {
          name: 'waste_posts_approvedRecyclerId'
        });
      }

      if (!indexNames.includes('waste_posts_pickupDeadline')) {
        await queryInterface.addIndex('waste_posts', ['pickupDeadline'], {
          name: 'waste_posts_pickupDeadline'
        });
      }
    } catch (error) {
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableExists = await queryInterface.tableExists('waste_posts');
    
    if (!tableExists) {

      return;
    }

    const table = await queryInterface.describeTable('waste_posts');

    // Remove columns in reverse order
    if (table.pickedUpAt) {
      await queryInterface.removeColumn('waste_posts', 'pickedUpAt');
    }

    if (table.pickupDeadline) {
      await queryInterface.removeColumn('waste_posts', 'pickupDeadline');
    }

    if (table.approvedRecyclerId) {
      await queryInterface.removeColumn('waste_posts', 'approvedRecyclerId');
    }

    if (table.collectionStatus) {
      await queryInterface.removeColumn('waste_posts', 'collectionStatus');
    }
  }
};
