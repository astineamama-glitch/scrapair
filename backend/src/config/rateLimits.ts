export const rateLimitConfig = {
  typing: {
    windowMs: 1000, 
    maxPerUser: 10, 
    maxPerIP: 50, 
    skipSuccessfulRequests: false,
    keyGenerator: (userId: string, ip: string) => ({
      user: `ratelimit:typing:${userId}`,
      ip: `ratelimit:typing:ip:${ip}`
    })
  },

  createConversation: {
    windowMs: 60 * 60 * 1000, 
    maxPerUser: 10,
    maxPerIP: 50,
    keyGenerator: (userId: string, ip: string) => ({
      user: `ratelimit:conv_create:${userId}`,
      ip: `ratelimit:conv_create:ip:${ip}`
    })
  },

  sendMessage: {
    windowMs: 60 * 1000, 
    maxPerUser: 100,
    maxPerIP: 500, 
    keyGenerator: (userId: string, ip: string) => ({
      user: `ratelimit:msg:${userId}`,
      ip: `ratelimit:msg:ip:${ip}`
    })
  },

  getConversations: {
    windowMs: 60 * 1000,
    maxPerUser: 30,
    maxPerIP: 100,
    keyGenerator: (userId: string, ip: string) => ({
      user: `ratelimit:get_conv:${userId}`,
      ip: `ratelimit:get_conv:ip:${ip}`
    })
  },

  getMessages: {
    windowMs: 60 * 1000, 
    maxPerUser: 50, 
    maxPerIP: 200,
    keyGenerator: (userId: string, ip: string) => ({
      user: `ratelimit:get_msg:${userId}`,
      ip: `ratelimit:get_msg:ip:${ip}`
    })
  },

  createWastePost: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxPerUser: 10,
    maxPerIP: 50,
    keyGenerator: (userId: string, ip: string) => ({
      user: `ratelimit:waste_create:${userId}`,
      ip: `ratelimit:waste_create:ip:${ip}`
    })
  },

  updateWastePost: {
    windowMs: 60 * 60 * 1000,
    maxPerUser: 20,
    maxPerIP: 100,
    keyGenerator: (userId: string, ip: string) => ({
      user: `ratelimit:waste_update:${userId}`,
      ip: `ratelimit:waste_update:ip:${ip}`
    })
  },

  createCollection: {
    windowMs: 60 * 60 * 1000,
    maxPerUser: 5,
    maxPerIP: 20,
    keyGenerator: (userId: string, ip: string) => ({
      user: `ratelimit:coll_create:${userId}`,
      ip: `ratelimit:coll_create:ip:${ip}`
    })
  },

  updateCollection: {
    windowMs: 60 * 60 * 1000,
    maxPerUser: 10,
    maxPerIP: 50,
    keyGenerator: (userId: string, ip: string) => ({
      user: `ratelimit:coll_update:${userId}`,
      ip: `ratelimit:coll_update:ip:${ip}`
    })
  },

  login: {
    windowMs: 60 * 1000, // 1 minute
    maxPerUser: 5,
    maxPerIP: 10,
    keyGenerator: (userId: string, ip: string) => ({
      user: `ratelimit:login:${userId}`,
      ip: `ratelimit:login:ip:${ip}`
    })
  },

  passwordReset: {
    windowMs: 60 * 60 * 1000, 
    maxPerUser: 3,
    maxPerIP: 10,
    keyGenerator: (userId: string, ip: string) => ({
      user: `ratelimit:pwreset:${userId}`,
      ip: `ratelimit:pwreset:ip:${ip}`
    })
  },

  register: {
    windowMs: 60 * 60 * 1000,
    maxPerUser: process.env.NODE_ENV === 'development' ? 50 : 2,
    maxPerIP: process.env.NODE_ENV === 'development' ? 100 : 5,
    keyGenerator: (userId: string, ip: string) => ({
      user: `ratelimit:register:${userId}`,
      ip: `ratelimit:register:ip:${ip}`
    })
  },

  createMaterial: {
    windowMs: 60 * 60 * 1000,
    maxPerUser: 5,
    maxPerIP: 20,
    keyGenerator: (userId: string, ip: string) => ({
      user: `ratelimit:mat_create:${userId}`,
      ip: `ratelimit:mat_create:ip:${ip}`
    })
  },

  createReview: {
    windowMs: 24 * 60 * 60 * 1000, // 1 day
    maxPerUser: 20,
    maxPerIP: 100,
    keyGenerator: (userId: string, ip: string) => ({
      user: `ratelimit:review_create:${userId}`,
      ip: `ratelimit:review_create:ip:${ip}`
    })
  },

  createRating: {
    windowMs: 24 * 60 * 60 * 1000,
    maxPerUser: 30,
    maxPerIP: 150,
    keyGenerator: (userId: string, ip: string) => ({
      user: `ratelimit:rating_create:${userId}`,
      ip: `ratelimit:rating_create:ip:${ip}`
    })
  },

  createFeedback: {
    windowMs: 24 * 60 * 60 * 1000,
    maxPerUser: 10,
    maxPerIP: 50,
    keyGenerator: (userId: string, ip: string) => ({
      user: `ratelimit:feedback_create:${userId}`,
      ip: `ratelimit:feedback_create:ip:${ip}`
    })
  },

  getNotifications: {
    windowMs: 60 * 1000,
    maxPerUser: 50,
    maxPerIP: 200,
    keyGenerator: (userId: string, ip: string) => ({
      user: `ratelimit:notif_get:${userId}`,
      ip: `ratelimit:notif_get:ip:${ip}`
    })
  }
};

export default rateLimitConfig;
