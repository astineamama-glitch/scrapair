'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Migration to rename collection status VARCHAR values:
     * 'completed' → 'pickup_confirmed'
     * 'confirmed' → 'materials_accepted'
     * 
     * The status column is VARCHAR (character varying), not ENUM,
     * so this is a simple data update with no type changes needed.
     */

    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Update all 'completed' values to 'pickup_confirmed'
      await queryInterface.sequelize.query(
        `UPDATE "collections" SET "status" = 'pickup_confirmed' WHERE "status" = 'completed'`,
        { transaction }
      );

      // Update all 'confirmed' values to 'materials_accepted'
      await queryInterface.sequelize.query(
        `UPDATE "collections" SET "status" = 'materials_accepted' WHERE "status" = 'confirmed'`,
        { transaction }
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    /**
     * Rollback migration - revert to original status values
     */

    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Revert 'pickup_confirmed' back to 'completed'
      await queryInterface.sequelize.query(
        `UPDATE "collections" SET "status" = 'completed' WHERE "status" = 'pickup_confirmed'`,
        { transaction }
      );

      // Revert 'materials_accepted' back to 'confirmed'
      await queryInterface.sequelize.query(
        `UPDATE "collections" SET "status" = 'materials_accepted' WHERE "status" = 'confirmed'`,
        { transaction }
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
