import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ScrapAir API Documentation',
      version: '1.0.0',
      description: 'Complete REST API documentation for the ScrapAir platform - A marketplace connecting businesses with recyclable materials to recycling artists.',
      contact: {
        name: 'ScrapAir Support',
        email: 'support@scrapair.com'
      }
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}`,
        description: 'Development Server'
      },
      {
        url: 'https://api.scrapair.com',
        description: 'Production Server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Authentication Token'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string', format: 'email' },
            type: { type: 'string', enum: ['business', 'recycler'] },
            isVerified: { type: 'boolean' },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        WastePost: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            businessUserId: { type: 'string' },
            materialType: { type: 'string' },
            quantity: { type: 'number' },
            description: { type: 'string' },
            status: { type: 'string', enum: ['active', 'closed', 'archived'] },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Collection: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            wastePostId: { type: 'string' },
            recyclerUserId: { type: 'string' },
            status: { type: 'string', enum: ['pending', 'requested', 'approved', 'scheduled', 'pickup_confirmed', 'materials_accepted', 'rejected', 'cancelled', 'expired'] },
            scheduledDate: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
            statusCode: { type: 'number' }
          }
        }
      }
    }
  },
  apis: [
    './src/routes/authRoutes.ts',
    './src/routes/userRoutes.ts',
    './src/routes/wastePostRoutes.ts',
    './src/routes/collectionRoutes.ts',
    './src/routes/messageRoutes.ts',
    './src/routes/notificationRoutes.ts',
    './src/routes/reviewRoutes.ts',
    './src/routes/ratingRoutes.ts',
    './src/routes/reportRoutes.ts'
  ]
};

export const swaggerSpec = swaggerJsdoc(options);
