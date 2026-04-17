'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.sequelize.query(`
        ALTER TABLE "collections" 
        DROP CONSTRAINT IF EXISTS "collections_postId_fkey";
      `, { transaction });

      await queryInterface.sequelize.query(`
        ALTER TABLE "collections" 
        ADD CONSTRAINT "collections_postId_fkey" 
        FOREIGN KEY ("postId") 
        REFERENCES "waste_posts"(id) 
        ON DELETE RESTRICT;
      `, { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.sequelize.query(`
        ALTER TABLE "collections" 
        DROP CONSTRAINT IF EXISTS "collections_postId_fkey";
      `, { transaction });

      await queryInterface.sequelize.query(`
        ALTER TABLE "collections" 
        ADD CONSTRAINT "collections_postId_fkey" 
        FOREIGN KEY ("postId") 
        REFERENCES "waste_posts"(id) 
        ON DELETE CASCADE;
      `, { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
