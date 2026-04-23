'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Update the status enum to include new values
    // PostgreSQL requires dropping the default first
    await queryInterface.sequelize.query(`
      BEGIN;
      
      -- Drop default constraint first
      ALTER TABLE reports ALTER COLUMN status DROP DEFAULT;
      
      -- Create new enum type
      CREATE TYPE enum_reports_status_new AS ENUM (
        'pending', 
        'under_review', 
        'valid_confirmed', 
        'invalid_confirmed', 
        'escalated'
      );
      
      -- Alter the column to use new enum type
      ALTER TABLE reports 
      ALTER COLUMN status TYPE enum_reports_status_new 
      USING status::text::enum_reports_status_new;
      
      -- Set the default again
      ALTER TABLE reports ALTER COLUMN status SET DEFAULT 'pending';
      
      -- Drop old enum type
      DROP TYPE IF EXISTS enum_reports_status;
      
      -- Rename new enum type
      ALTER TYPE enum_reports_status_new RENAME TO enum_reports_status;
      
      COMMIT;
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Revert to old enum
    await queryInterface.sequelize.query(`
      BEGIN;
      
      -- Drop default constraint first
      ALTER TABLE reports ALTER COLUMN status DROP DEFAULT;
      
      CREATE TYPE enum_reports_status_new AS ENUM ('pending', 'approved', 'rejected');
      
      ALTER TABLE reports 
      ALTER COLUMN status TYPE enum_reports_status_new 
      USING CASE 
        WHEN status = 'valid_confirmed' THEN 'approved'::enum_reports_status_new
        WHEN status = 'invalid_confirmed' THEN 'rejected'::enum_reports_status_new
        WHEN status = 'pending' THEN 'pending'::enum_reports_status_new
        WHEN status = 'under_review' THEN 'pending'::enum_reports_status_new
        WHEN status = 'escalated' THEN 'pending'::enum_reports_status_new
        ELSE 'pending'::enum_reports_status_new
      END;
      
      -- Set the default again
      ALTER TABLE reports ALTER COLUMN status SET DEFAULT 'pending';
      
      DROP TYPE IF EXISTS enum_reports_status;
      
      ALTER TYPE enum_reports_status_new RENAME TO enum_reports_status;
      
      COMMIT;
    `);
  }
};
