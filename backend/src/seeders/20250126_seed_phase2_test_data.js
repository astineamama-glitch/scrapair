module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create test business user for Phase 2
    const businessUser = await queryInterface.sequelize.query(
      `INSERT INTO "users" (type, email, password, "businessName", phone, "isActive", "isVerified", "createdAt", "updatedAt")
       VALUES ('business', 'phase2business@example.com', '$2a$10$YourHashedPasswordHere1234567890', 'Phase 2 Test Business', '+63-999-111-2222', true, true, NOW(), NOW())
       ON CONFLICT (email) DO NOTHING
       RETURNING id;`,
      { raw: true }
    );

    // Create test recycler user for Phase 2
    const recyclerUser = await queryInterface.sequelize.query(
      `INSERT INTO "users" (type, email, password, "companyName", phone, specialization, "isActive", "isVerified", "createdAt", "updatedAt")
       VALUES ('recycler', 'phase2recycler@example.com', '$2a$10$YourHashedPasswordHere1234567890', 'Phase 2 Test Recycler Co', '+63-999-333-4444', 'Plastics & Metals', true, true, NOW(), NOW())
       ON CONFLICT (email) DO NOTHING
       RETURNING id;`,
      { raw: true }
    );

    // Get the actual user IDs
    const businessResult = await queryInterface.sequelize.query(
      `SELECT id FROM "users" WHERE email = 'phase2business@example.com' LIMIT 1;`,
      { raw: true }
    );

    const businessId = businessResult[0]?.[0]?.id;

    // Create active waste post for Phase 2 Collection testing
    if (businessId) {
      await queryInterface.sequelize.query(
        `INSERT INTO "waste_posts" 
         (title, description, "wasteType", quantity, unit, "condition", location, latitude, longitude, city, address, "businessId", status, visibility, "createdAt", "updatedAt")
         VALUES 
         ('Mixed Plastic Waste for Phase 2 Testing', 'HDPE and PET plastic scraps available for collection. Good condition, bulk quantity available.', 'plastic', 500, 'kg', 'good', 'Industrial Zone', 14.5995, 120.9842, 'Manila', '123 Business Street, Manila', ${businessId}, 'active', 'public', NOW(), NOW())
         ON CONFLICT DO NOTHING;`,
        { raw: true }
      );

      await queryInterface.sequelize.query(
        `INSERT INTO "waste_posts" 
         (title, description, "wasteType", quantity, unit, "condition", location, latitude, longitude, city, address, "businessId", status, visibility, "createdAt", "updatedAt")
         VALUES 
         ('Metal Scraps for Phase 2 Testing', 'Aluminum and steel scraps from manufacturing. Multiple pallets available.', 'metal', 250, 'kg', 'fair', 'Factory District', 14.6091, 120.9750, 'Quezon City', '456 Factory Ave, QC', ${businessId}, 'active', 'public', NOW(), NOW())
         ON CONFLICT DO NOTHING;`,
        { raw: true }
      );

      await queryInterface.sequelize.query(
        `INSERT INTO "waste_posts" 
         (title, description, "wasteType", quantity, unit, "condition", location, latitude, longitude, city, address, "businessId", status, visibility, "createdAt", "updatedAt")
         VALUES 
         ('Electronic Waste Component Testing', 'Old computer components and circuit boards. Ready for immediate collection.', 'electronics', 100, 'units', 'good', 'Tech Park', 14.5780, 120.9880, 'Makati', '789 Tech Street, Makati', ${businessId}, 'active', 'public', NOW(), NOW())
         ON CONFLICT DO NOTHING;`,
        { raw: true }
      );
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Delete test data in reverse order
    await queryInterface.sequelize.query(
      `DELETE FROM "waste_posts" WHERE title LIKE '%Phase 2%' OR title LIKE '%Testing%';`,
      { raw: true }
    );

    await queryInterface.sequelize.query(
      `DELETE FROM "users" WHERE email IN ('phase2business@example.com', 'phase2recycler@example.com');`,
      { raw: true }
    );
  }
};
