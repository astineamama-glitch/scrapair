'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if the column exists
    const tableDescription = await queryInterface.describeTable('reports');
    
    if (tableDescription.approvedBy) {
      // Execute raw SQL to handle the type conversion properly
      await queryInterface.sequelize.query(`
        BEGIN;
        
        -- Drop the old foreign key if exists
        DO $$ BEGIN
          ALTER TABLE reports DROP CONSTRAINT reports_approvedBy_fkey1;
        EXCEPTION WHEN undefined_object THEN
          NULL;
        END $$;
        
        -- Drop the column and recreate it as UUID
        ALTER TABLE reports DROP COLUMN "approvedBy";
        ALTER TABLE reports ADD COLUMN "approvedBy" UUID;
        
        -- Add new foreign key to admin_users
        ALTER TABLE reports
        ADD CONSTRAINT reports_approvedBy_fkey
        FOREIGN KEY ("approvedBy") REFERENCES admin_users(id) ON DELETE SET NULL;
        
        COMMIT;
      `);
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Revert to INTEGER
    const tableDescription = await queryInterface.describeTable('reports');
    
    if (tableDescription.approvedBy) {
      await queryInterface.sequelize.query(`
        BEGIN;
        
        ALTER TABLE reports DROP CONSTRAINT IF EXISTS reports_approvedBy_fkey;
        ALTER TABLE reports DROP COLUMN "approvedBy";
        ALTER TABLE reports ADD COLUMN "approvedBy" INTEGER;
        
        COMMIT;
      `);
    }
  }
};
