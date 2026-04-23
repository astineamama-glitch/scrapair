const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { sequelize } = require('../dist/models');

(async () => {
  try {
    const AdminUser = sequelize.models.AdminUser;
    
    // Create default admin user
    const admin = await AdminUser.create({
      username: 'admin',
      email: 'admin@scrapair.com',
      password: 'admin123',
      role: 'ADMIN'
    });

    console.log('✓ Default admin user created successfully');
    console.log(`\nAdmin Credentials:`);
    console.log(`  Username: admin`);
    console.log(`  Password: admin123`);
    console.log(`  Email: admin@scrapair.com`);
    console.log(`  Role: ADMIN`);
    console.log(`  ID: ${admin.id}`);

  } catch (e) {
    if (e.message.includes('Validation error') || e.message.includes('unique')) {
      console.log('✓ Admin user already exists');
    } else {
      console.log('Error:', e.message);
    }
  }
  await sequelize.close();
})();
