import { QueryInterface } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface, Sequelize: any) => {
    // Sample business users
    const sampleBusinessUsers = [
      {
        type: 'business',
        email: 'steel_corp@example.com',
        password: '$2a$10$K1x5nxO9K1x5nxO9K1x5nxO9K1x5nxO9K1x5nxO9K1x5nxO9K1x5n', // bcrypt: password123
        businessName: 'Steel Corp Manufacturing',
        phone: '555-0101',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        type: 'business',
        email: 'recycle_metals@example.com',
        password: '$2a$10$K1x5nxO9K1x5nxO9K1x5nxO9K1x5nxO9K1x5nxO9K1x5nxO9K1x5n',
        businessName: 'Recycle Metals Ltd',
        phone: '555-0102',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Sample recycler users
    const sampleRecyclerUsers = [
      {
        type: 'recycler',
        email: 'green_recyclers@example.com',
        password: '$2a$10$K1x5nxO9K1x5nxO9K1x5nxO9K1x5nxO9K1x5nxO9K1x5nxO9K1x5n',
        companyName: 'Green Recyclers Inc',
        phone: '555-0201',
        specialization: 'Metals, Copper, Aluminum',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        type: 'recycler',
        email: 'eco_solutions@example.com',
        password: '$2a$10$K1x5nxO9K1x5nxO9K1x5nxO9K1x5nxO9K1x5nxO9K1x5nxO9K1x5n',
        companyName: 'Eco Solutions',
        phone: '555-0202',
        specialization: 'Plastics, Wood',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('users', [
      ...sampleBusinessUsers,
      ...sampleRecyclerUsers
    ]);

    // Get the inserted users to reference their IDs
    const users: any[] = await queryInterface.sequelize.query(
      'SELECT id FROM users WHERE email IN (?, ?)',
      {
        replacements: ['steel_corp@example.com', 'recycle_metals@example.com'],
        type: Sequelize.QueryTypes.SELECT
      }
    );

    if (!users || users.length < 2) {
      throw new Error('Failed to retrieve inserted users');
    }

    // Sample materials
    const sampleMaterials = [
      {
        businessUserId: (users[0] as any).id,
        materialType: 'Bronze',
        quantity: 500.5,
        unit: 'kg',
        description: 'High-quality bronze scraps from manufacturing process. Ideal for artists and recyclers.',
        contactEmail: 'steel_corp@example.com',
        status: 'available',
        isRecommendedForArtists: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        businessUserId: (users[0] as any).id,
        materialType: 'Copper',
        quantity: 250.0,
        unit: 'kg',
        description: 'Pure copper wires and sheets. Excellent electrical properties.',
        contactEmail: 'steel_corp@example.com',
        status: 'available',
        isRecommendedForArtists: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        businessUserId: (users[1] as any).id,
        materialType: 'Aluminum',
        quantity: 1000.0,
        unit: 'kg',
        description: 'Aluminum cans and sheets. Lightweight and recyclable.',
        contactEmail: 'recycle_metals@example.com',
        status: 'available',
        isRecommendedForArtists: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('materials', sampleMaterials);
  },

  down: async (queryInterface: QueryInterface, Sequelize: any) => {
    await queryInterface.bulkDelete('materials', {}, {});
    await queryInterface.bulkDelete('users', {}, {});
  }
};
