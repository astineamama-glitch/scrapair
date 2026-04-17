'use strict';

/**
 * COMPREHENSIVE DATABASE SCHEMA BOOTSTRAP
 * 
 * This migration creates the complete ScrapAir database schema from scratch.
 * It combines all individual migrations into a single atomic transaction.
 * 
 * Use this for:
 * - Fresh installations
 * - Clean database setup
 * - New development environments
 * 
 * Tables created (in order):
 * 1. users - Base user table
 * 2. materials - Material posts
 * 3. waste_posts - Waste material listings
 * 4. collections - Collection requests
 * 5. conversations - User conversations
 * 6. messages - Messages within conversations
 * 7. notifications - User notifications
 * 8. post_messages - Messages on specific posts
 * 9. reviews - User reviews and ratings
 * 10. password_audits - Password change history
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // ============================================
      // 1. CREATE USERS TABLE (Base table)
      // ============================================
      const usersTableExists = await queryInterface.tableExists('users');
      if (!usersTableExists) {
        await queryInterface.createTable('users', {
          id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
          },
          type: {
            type: Sequelize.ENUM('business', 'recycler'),
            allowNull: false,
            comment: 'User type: business owner or recycler'
          },
          email: {
            type: Sequelize.STRING(100),
            allowNull: false,
            unique: true
          },
          password: {
            type: Sequelize.STRING(255),
            allowNull: false
          },
          businessName: {
            type: Sequelize.STRING(150),
            allowNull: true,
            comment: 'For business users'
          },
          companyName: {
            type: Sequelize.STRING(150),
            allowNull: true,
            comment: 'For recycler users'
          },
          phone: {
            type: Sequelize.STRING(20),
            allowNull: false
          },
          specialization: {
            type: Sequelize.STRING(200),
            allowNull: true,
            comment: 'For recycler users - what they specialize in'
          },
          isActive: {
            type: Sequelize.BOOLEAN,
            defaultValue: true
          },
          isVerified: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
            comment: 'Whether the user has been verified by admin'
          },
          passwordHistory: {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'JSON array of last 5 hashed passwords for reuse prevention'
          },
          createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
          },
          updatedAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
          }
        }, { transaction });

        await queryInterface.addIndex('users', ['email'], { transaction });
        await queryInterface.addIndex('users', ['type'], { transaction });
      }

      // ============================================
      // 2. CREATE MATERIALS TABLE
      // ============================================
      const materialsTableExists = await queryInterface.tableExists('materials');
      if (!materialsTableExists) {
        await queryInterface.createTable('materials', {
          id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
          },
          businessUserId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
              model: 'users',
              key: 'id'
            },
            onDelete: 'CASCADE',
            comment: 'Reference to the business user who posted this material'
          },
          materialType: {
            type: Sequelize.STRING(100),
            allowNull: false,
            comment: 'Type of material (e.g., Bronze, Copper, Plastic, etc.)'
          },
          quantity: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: false,
            comment: 'Quantity of the material'
          },
          unit: {
            type: Sequelize.STRING(50),
            defaultValue: 'kg',
            comment: 'Unit of measurement (kg, lbs, pieces, etc.)'
          },
          description: {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'Detailed description of the material'
          },
          contactEmail: {
            type: Sequelize.STRING(100),
            allowNull: false
          },
          status: {
            type: Sequelize.ENUM('available', 'reserved', 'sold'),
            defaultValue: 'available',
            comment: 'Current status of the material post'
          },
          isRecommendedForArtists: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
            comment: 'Whether this material is recommended for artists'
          },
          createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
          },
          updatedAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
          }
        }, { transaction });

        await queryInterface.addIndex('materials', ['businessUserId'], { transaction });
        await queryInterface.addIndex('materials', ['materialType'], { transaction });
        await queryInterface.addIndex('materials', ['status'], { transaction });
        await queryInterface.addIndex('materials', ['isRecommendedForArtists'], { transaction });
      }

      // ============================================
      // 3. CREATE WASTE_POSTS TABLE
      // ============================================
      const wastePostsTableExists = await queryInterface.tableExists('waste_posts');
      if (!wastePostsTableExists) {
        await queryInterface.createTable('waste_posts', {
          id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
          },
          businessId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
              model: 'users',
              key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
          },
          title: {
            type: Sequelize.STRING(255),
            allowNull: false
          },
          description: {
            type: Sequelize.TEXT,
            allowNull: false
          },
          wasteType: {
            type: Sequelize.STRING(100),
            allowNull: false
          },
          quantity: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: false
          },
          unit: {
            type: Sequelize.STRING(50),
            allowNull: false,
            defaultValue: 'kg'
          },
          condition: {
            type: Sequelize.ENUM('poor', 'fair', 'good', 'excellent'),
            allowNull: false
          },
          location: {
            type: Sequelize.STRING(255),
            allowNull: false
          },
          latitude: {
            type: Sequelize.DECIMAL(10, 8),
            allowNull: false
          },
          longitude: {
            type: Sequelize.DECIMAL(11, 8),
            allowNull: false
          },
          city: {
            type: Sequelize.STRING(100),
            allowNull: false
          },
          address: {
            type: Sequelize.STRING(255),
            allowNull: false
          },
          price: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: true
          },
          images: {
            type: Sequelize.JSON,
            allowNull: true,
            defaultValue: []
          },
          status: {
            type: Sequelize.ENUM('draft', 'active', 'reserved', 'collected'),
            allowNull: false,
            defaultValue: 'draft'
          },
          visibility: {
            type: Sequelize.ENUM('private', 'public'),
            allowNull: false,
            defaultValue: 'public'
          },
          availabilityCount: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 1
          },
          collectionStatus: {
            type: Sequelize.ENUM('ACTIVE', 'APPROVED', 'PICKED_UP', 'COMPLETED'),
            defaultValue: 'ACTIVE',
            comment: 'Collection workflow status'
          },
          approvedRecyclerId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
              model: 'users',
              key: 'id'
            },
            comment: 'ID of the recycler approved to collect this waste'
          },
          pickupDeadline: {
            type: Sequelize.DATE,
            allowNull: true,
            comment: 'Deadline for recycler to pick up'
          },
          pickedUpAt: {
            type: Sequelize.DATE,
            allowNull: true,
            comment: 'Timestamp when recycler marked as picked up'
          },
          createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
          },
          updatedAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
          }
        }, { transaction });

        await queryInterface.addIndex('waste_posts', ['businessId'], { transaction });
        await queryInterface.addIndex('waste_posts', ['status'], { transaction });
        await queryInterface.addIndex('waste_posts', ['wasteType'], { transaction });
        await queryInterface.addIndex('waste_posts', ['latitude', 'longitude'], { transaction });
        await queryInterface.addIndex('waste_posts', ['createdAt'], { transaction });
        await queryInterface.addIndex('waste_posts', ['visibility'], { transaction });
        await queryInterface.addIndex('waste_posts', ['collectionStatus'], { transaction });
        await queryInterface.addIndex('waste_posts', ['approvedRecyclerId'], { transaction });
        await queryInterface.addIndex('waste_posts', ['pickupDeadline'], { transaction });
      }

      // ============================================
      // 4. CREATE COLLECTIONS TABLE
      // ============================================
      const collectionsTableExists = await queryInterface.tableExists('collections');
      if (!collectionsTableExists) {
        await queryInterface.createTable('collections', {
          id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
          },
          postId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
              model: 'waste_posts',
              key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT'
          },
          recyclerId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
              model: 'users',
              key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
          },
          businessId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
              model: 'users',
              key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
          },
          requestDate: {
            type: Sequelize.STRING,
            allowNull: true,
            comment: 'ISO string format to avoid timezone conversion'
          },
          scheduledDate: {
            type: Sequelize.STRING,
            allowNull: true,
            comment: 'ISO string format to avoid timezone conversion'
          },
          status: {
            type: Sequelize.ENUM('pending', 'requested', 'approved', 'scheduled', 'completed', 'confirmed', 'rejected', 'cancelled', 'expired'),
            allowNull: false,
            defaultValue: 'pending'
          },
          confirmedBy: {
            type: Sequelize.ENUM('recycler', 'business'),
            allowNull: true
          },
          completedAt: {
            type: Sequelize.DATE,
            allowNull: true
          },
          transactionCode: {
            type: Sequelize.STRING,
            allowNull: true,
            unique: true,
            comment: 'Unique transaction code format: COLL-YYYYMMDD-NNN'
          },
          rejectionCount: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: 'Counter for rejections by business'
          },
          cancellationCount: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: 'Counter for cancellations by recycler'
          },
          cancellationReason: {
            type: Sequelize.ENUM('SCHEDULE_TOO_LONG', 'TIME_CONFLICT', 'RECYCLER_UNAVAILABLE', 'OTHER'),
            allowNull: true,
            comment: 'Reason provided when cancelling'
          },
          previousCollectionId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
              model: 'collections',
              key: 'id'
            },
            comment: 'Reference to previous collection if this is a retry'
          },
          isRetry: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            comment: 'Flag indicating if this is a retry after cancellation/rejection'
          },
          createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
          },
          updatedAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
          }
        }, { transaction });

        await queryInterface.addIndex('collections', ['postId'], { transaction });
        await queryInterface.addIndex('collections', ['recyclerId'], { transaction });
        await queryInterface.addIndex('collections', ['businessId'], { transaction });
        await queryInterface.addIndex('collections', ['status'], { transaction });
        await queryInterface.addIndex('collections', ['requestDate'], { transaction });
        await queryInterface.addIndex('collections', ['scheduledDate'], { transaction });
        
        // Unique constraint for active collections on same post
        await queryInterface.sequelize.query(
          `CREATE UNIQUE INDEX idx_collections_postid_recyclerid_active 
           ON "collections"("postId", "recyclerId") 
           WHERE "status" IN ('pending', 'approved', 'scheduled')`,
          { transaction }
        );
      }

      // ============================================
      // 5. CREATE CONVERSATIONS TABLE
      // ============================================
      const conversationsTableExists = await queryInterface.tableExists('conversations');
      if (!conversationsTableExists) {
        await queryInterface.createTable('conversations', {
          id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
          },
          participant1Id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
              model: 'users',
              key: 'id'
            },
            onDelete: 'CASCADE'
          },
          participant2Id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
              model: 'users',
              key: 'id'
            },
            onDelete: 'CASCADE'
          },
          wastePostId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
              model: 'waste_posts',
              key: 'id'
            },
            onDelete: 'SET NULL'
          },
          lastMessageAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
          },
          createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
          },
          updatedAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
          }
        }, { transaction });

        await queryInterface.addIndex('conversations', ['participant1Id', 'participant2Id'], {
          name: 'idx_conversation_participants',
          transaction
        });
        await queryInterface.addIndex('conversations', ['createdAt'], {
          name: 'idx_conversation_created',
          transaction
        });
      }

      // ============================================
      // 6. CREATE MESSAGES TABLE
      // ============================================
      const messagesTableExists = await queryInterface.tableExists('messages');
      if (!messagesTableExists) {
        await queryInterface.createTable('messages', {
          id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
          },
          conversationId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
              model: 'conversations',
              key: 'id'
            },
            onDelete: 'CASCADE'
          },
          senderId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
              model: 'users',
              key: 'id'
            },
            onDelete: 'CASCADE'
          },
          recipientId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
              model: 'users',
              key: 'id'
            },
            onDelete: 'CASCADE'
          },
          content: {
            type: Sequelize.TEXT,
            allowNull: false
          },
          imageUrl: {
            type: Sequelize.STRING(500),
            allowNull: true
          },
          createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
          },
          updatedAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
          }
        }, { transaction });

        await queryInterface.addIndex('messages', ['conversationId'], {
          name: 'idx_message_conversation',
          transaction
        });
        await queryInterface.addIndex('messages', ['senderId'], {
          name: 'idx_message_sender',
          transaction
        });
        await queryInterface.addIndex('messages', ['createdAt'], {
          name: 'idx_message_created',
          transaction
        });
      }

      // ============================================
      // 7. CREATE NOTIFICATIONS TABLE
      // ============================================
      const notificationsTableExists = await queryInterface.tableExists('notifications');
      if (!notificationsTableExists) {
        await queryInterface.createTable('notifications', {
          id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
          },
          userId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
              model: 'users',
              key: 'id'
            },
            onDelete: 'CASCADE'
          },
          type: {
            type: Sequelize.ENUM('MESSAGE', 'COLLECTION_REQUEST', 'INQUIRY'),
            allowNull: false,
            defaultValue: 'MESSAGE'
          },
          title: {
            type: Sequelize.STRING(255),
            allowNull: false
          },
          message: {
            type: Sequelize.TEXT,
            allowNull: false
          },
          relatedId: {
            type: Sequelize.INTEGER,
            allowNull: true
          },
          read: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false
          },
          createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
          },
          updatedAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
          }
        }, { transaction });

        await queryInterface.addIndex('notifications', ['userId'], {
          name: 'idx_notification_user',
          transaction
        });
        await queryInterface.addIndex('notifications', ['read'], {
          name: 'idx_notification_read',
          transaction
        });
        await queryInterface.addIndex('notifications', ['createdAt'], {
          name: 'idx_notification_created',
          transaction
        });
      }

      // ============================================
      // 8. CREATE POST_MESSAGES TABLE
      // ============================================
      const postMessagesTableExists = await queryInterface.tableExists('post_messages');
      if (!postMessagesTableExists) {
        await queryInterface.createTable('post_messages', {
          id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
          },
          postId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
              model: 'waste_posts',
              key: 'id'
            },
            onDelete: 'CASCADE'
          },
          senderId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
              model: 'users',
              key: 'id'
            },
            onDelete: 'CASCADE'
          },
          recipientId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
              model: 'users',
              key: 'id'
            },
            onDelete: 'CASCADE'
          },
          subject: {
            type: Sequelize.STRING(255),
            allowNull: true
          },
          message: {
            type: Sequelize.TEXT,
            allowNull: false
          },
          isRead: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false
          },
          createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
          },
          updatedAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
          }
        }, { transaction });

        await queryInterface.addIndex('post_messages', ['postId'], { transaction });
        await queryInterface.addIndex('post_messages', ['senderId'], { transaction });
        await queryInterface.addIndex('post_messages', ['recipientId'], { transaction });
        await queryInterface.addIndex('post_messages', ['isRead'], { transaction });
      }

      // ============================================
      // 9. CREATE REVIEWS TABLE
      // ============================================
      const reviewsTableExists = await queryInterface.tableExists('reviews');
      if (!reviewsTableExists) {
        await queryInterface.createTable('reviews', {
          id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
          },
          businessId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
              model: 'users',
              key: 'id'
            },
            onDelete: 'CASCADE'
          },
          reviewerId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
              model: 'users',
              key: 'id'
            },
            onDelete: 'CASCADE'
          },
          postId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
              model: 'waste_posts',
              key: 'id'
            },
            onDelete: 'SET NULL'
          },
          rating: {
            type: Sequelize.INTEGER,
            allowNull: false,
            validate: {
              min: 1,
              max: 5
            }
          },
          comment: {
            type: Sequelize.TEXT,
            allowNull: true
          },
          createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
          },
          updatedAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
          }
        }, { transaction });

        await queryInterface.addIndex('reviews', ['businessId'], { transaction });
      }

      // ============================================
      // 10. CREATE PASSWORD_AUDITS TABLE
      // ============================================
      const passwordAuditsTableExists = await queryInterface.tableExists('password_audits');
      if (!passwordAuditsTableExists) {
        await queryInterface.createTable('password_audits', {
          id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
          },
          userId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            comment: 'Reference to user'
          },
          email: {
            type: Sequelize.STRING(100),
            allowNull: false,
            comment: 'Email of user for easier lookup'
          },
          type: {
            type: Sequelize.ENUM('business', 'recycler'),
            allowNull: false,
            comment: 'User type'
          },
          changeType: {
            type: Sequelize.ENUM('reset', 'change'),
            allowNull: false,
            comment: 'reset = forgot password flow, change = edit profile flow'
          },
          ipAddress: {
            type: Sequelize.STRING(50),
            allowNull: true,
            comment: 'IP address from which password was changed'
          },
          userAgent: {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'Browser/device info'
          },
          status: {
            type: Sequelize.ENUM('success', 'failed'),
            allowNull: false,
            defaultValue: 'success',
            comment: 'Whether password change succeeded'
          },
          reason: {
            type: Sequelize.STRING(255),
            allowNull: true,
            comment: 'Reason for failure if applicable'
          },
          createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
          },
          updatedAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
          }
        }, { transaction });

        await queryInterface.addIndex('password_audits', ['userId'], { transaction });
        await queryInterface.addIndex('password_audits', ['email'], { transaction });
        await queryInterface.addIndex('password_audits', ['createdAt'], { transaction });
        await queryInterface.addIndex('password_audits', ['ipAddress'], { transaction });
        await queryInterface.addIndex('password_audits', ['changeType'], { transaction });
      }

      await transaction.commit();
      console.log('✅ Database schema created successfully!');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Migration failed:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Drop in reverse order (respecting foreign keys)
      await queryInterface.dropTableIfExists('password_audits', { transaction });
      await queryInterface.dropTableIfExists('reviews', { transaction });
      await queryInterface.dropTableIfExists('post_messages', { transaction });
      await queryInterface.dropTableIfExists('notifications', { transaction });
      await queryInterface.dropTableIfExists('messages', { transaction });
      await queryInterface.dropTableIfExists('conversations', { transaction });
      await queryInterface.dropTableIfExists('collections', { transaction });
      await queryInterface.dropTableIfExists('waste_posts', { transaction });
      await queryInterface.dropTableIfExists('materials', { transaction });
      await queryInterface.dropTableIfExists('users', { transaction });

      await transaction.commit();
      console.log('✅ Database schema rolled back successfully!');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Rollback failed:', error);
      throw error;
    }
  }
};
