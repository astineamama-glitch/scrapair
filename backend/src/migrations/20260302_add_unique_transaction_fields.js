'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.addColumn(
        'collections',
        'transactionCode',
        {
          type: Sequelize.STRING,
          allowNull: true,
          unique: true,
          comment: 'Unique transaction code format: COLL-YYYYMMDD-NNN'
        },
        { transaction }
      );
      await queryInterface.addColumn(
        'collections',
        'rejectionCount',
        {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
          comment: 'Counter for rejections by business on this recycler for this post'
        },
        { transaction }
      );
      await queryInterface.addColumn(
        'collections',
        'cancellationCount',
        {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
          comment: 'Counter for cancellations by recycler on this post (cumulative, never resets)'
        },
        { transaction }
      );
      await queryInterface.addColumn(
        'collections',
        'cancellationReason',
        {
          type: Sequelize.ENUM('SCHEDULE_TOO_LONG', 'TIME_CONFLICT', 'RECYCLER_UNAVAILABLE', 'OTHER'),
          allowNull: true,
          comment: 'Reason provided by business when cancelling collection'
        },
        { transaction }
      );
      await queryInterface.addColumn(
        'collections',
        'previousCollectionId',
        {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'collections',
            key: 'id'
          },
          comment: 'Reference to previous collection if this is a retry'
        },
        { transaction }
      );
      await queryInterface.addColumn(
        'collections',
        'isRetry',
        {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          comment: 'Flag indicating if this is a retry request after cancellation/rejection'
        },
        { transaction }
      );
            await queryInterface.sequelize.query(
        `CREATE UNIQUE INDEX idx_collections_postid_recyclerid_active 
         ON "collections"("postId", "recyclerId") 
         WHERE "status" IN ('pending', 'approved', 'scheduled')`,
        { transaction }
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.sequelize.query(
        `DROP INDEX IF EXISTS idx_collections_postid_recyclerid_active`,
        { transaction }
      );
      await queryInterface.removeColumn('collections', 'isRetry', { transaction });
      await queryInterface.removeColumn('collections', 'previousCollectionId', { transaction });
      await queryInterface.removeColumn('collections', 'cancellationReason', { transaction });
      await queryInterface.removeColumn('collections', 'cancellationCount', { transaction });
      await queryInterface.removeColumn('collections', 'rejectionCount', { transaction });
      await queryInterface.removeColumn('collections', 'transactionCode', { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
