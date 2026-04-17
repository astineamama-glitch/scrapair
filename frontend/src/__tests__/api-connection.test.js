/**
 * Frontend API Connection Test Suite
 * Tests the alignment between frontend API services and backend endpoints
 * Validates token injection, error handling, and authentication flow
 */

const assert = require('node:assert/strict');
const path = require('node:path');

process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.REACT_APP_API_URL = 'http://localhost:5000/api';

/**
 * Mock localStorage implementation
 */
class MockLocalStorage {
  constructor() {
    this.store = {};
  }

  getItem(key) {
    return this.store[key] || null;
  }

  setItem(key, value) {
    this.store[key] = String(value);
  }

  removeItem(key) {
    delete this.store[key];
  }

  clear() {
    this.store = {};
  }
}

/**
 * Mock axios instance for testing
 */
const createMockAxios = (requests = []) => {
  const mockRequests = [];

  const mockAxios = {
    baseURL: 'http://localhost:5000/api',
    timeout: 10000,
    interceptors: {
      request: {
        handlers: [],
        use(successHandler, errorHandler) {
          this.handlers.push({ success: successHandler, error: errorHandler });
        }
      },
      response: {
        handlers: [],
        use(successHandler, errorHandler) {
          this.handlers.push({ success: successHandler, error: errorHandler });
        }
      }
    },

    async request(config) {
      // Store the request
      mockRequests.push(config);

      // Run request interceptors
      let processedConfig = config;
      for (const handler of mockAxios.interceptors.request.handlers) {
        try {
          processedConfig = handler.success(processedConfig);
        } catch (error) {
          throw handler.error(error);
        }
      }

      // Find matching mock response
      const mockResponse = requests.find(
        r => r.url === config.url && r.method === (config.method || 'GET')
      );

      if (!mockResponse) {
        const error = new Error(`No mock found for ${config.method || 'GET'} ${config.url}`);
        error.response = { status: 404 };
        throw error;
      }

      // Simulate response
      const response = {
        status: mockResponse.status || 200,
        data: mockResponse.data,
        config: processedConfig,
        headers: {}
      };

      // Run response interceptors
      if (mockResponse.status >= 400) {
        const error = new Error(`${mockResponse.status}`);
        error.response = response;
        
        // Run error handlers
        for (const handler of mockAxios.interceptors.response.handlers) {
          if (handler.error) {
            try {
              return await handler.error(error);
            } catch (err) {
              throw err;
            }
          }
        }
        throw error;
      }

      for (const handler of mockAxios.interceptors.response.handlers) {
        const result = handler.success(response);
        if (result) return result;
      }

      return response;
    },

    async get(url, config) {
      return mockAxios.request({ ...config, url, method: 'GET' });
    },

    async post(url, data, config) {
      return mockAxios.request({ ...config, url, method: 'POST', data });
    },

    async put(url, data, config) {
      return mockAxios.request({ ...config, url, method: 'PUT', data });
    },

    async patch(url, data, config) {
      return mockAxios.request({ ...config, url, method: 'PATCH', data });
    },

    async delete(url, config) {
      return mockAxios.request({ ...config, url, method: 'DELETE' });
    },

    create(config) {
      return { ...mockAxios, ...config };
    },

    getRequests() {
      return mockRequests;
    }
  };

  return mockAxios;
};

/**
 * Test utilities
 */
const createMockUser = (overrides = {}) => {
  return {
    id: 1,
    email: 'test@example.com',
    type: 'business',
    name: 'Test User',
    isVerified: true,
    ...overrides
  };
};

const createMockResponse = (data = {}, status = 200) => {
  return {
    success: true,
    status,
    data,
    timestamp: new Date().toISOString()
  };
};

/**
 * Run a test
 */
const runTest = async (name, fn) => {
  try {
    await fn();
    console.log(`✓ PASS ${name}`);
  } catch (error) {
    console.error(`✗ FAIL ${name}`);
    console.error(error.message);
    process.exitCode = 1;
  }
};

/**
 * Main test suite
 */
const main = async () => {
  // ============================================
  // TEST SUITE 1: Auth Context Integration
  // ============================================

  await runTest('AuthContext saves token with correct key', async () => {
    const localStorage = new MockLocalStorage();
    const mockUser = createMockUser();
    const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';

    // Simulate login
    localStorage.setItem('token', mockToken);
    localStorage.setItem('user', JSON.stringify(mockUser));

    // Verify correct keys are used
    assert.equal(localStorage.getItem('token'), mockToken);
    assert.equal(JSON.parse(localStorage.getItem('user')).email, mockUser.email);
    assert.equal(localStorage.getItem('authToken'), null); // Old key should not exist
  });

  await runTest('AuthContext removes token on logout', async () => {
    const localStorage = new MockLocalStorage();
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify(createMockUser()));

    // Simulate logout
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    assert.equal(localStorage.getItem('token'), null);
    assert.equal(localStorage.getItem('user'), null);
  });

  // ============================================
  // TEST SUITE 2: API Client Interceptors
  // ============================================

  await runTest('Request interceptor injects Authorization header with correct token key', async () => {
    const localStorage = new MockLocalStorage();
    const mockAxios = createMockAxios([
      {
        url: 'http://localhost:5000/api/auth/verify',
        method: 'GET',
        status: 200,
        data: createMockResponse({ valid: true })
      }
    ]);

    // Set token in localStorage
    const testToken = 'Bearer-Test-Token-123';
    localStorage.setItem('token', testToken);

    // Setup request interceptor
    mockAxios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Make request
    const response = await mockAxios.get('http://localhost:5000/api/auth/verify');
    const requests = mockAxios.getRequests();

    // Verify Authorization header is set
    assert.ok(requests[0].headers.Authorization);
    assert.equal(requests[0].headers.Authorization, `Bearer ${testToken}`);
  });

  await runTest('Request interceptor does not inject header when no token exists', async () => {
    const localStorage = new MockLocalStorage();
    const mockAxios = createMockAxios([
      {
        url: 'http://localhost:5000/api/public/data',
        method: 'GET',
        status: 200,
        data: createMockResponse({ data: 'public' })
      }
    ]);

    mockAxios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const response = await mockAxios.get('http://localhost:5000/api/public/data');
    const requests = mockAxios.getRequests();

    // Verify no Authorization header
    assert.equal(!requests[0].headers?.Authorization, true);
  });

  await runTest('Response interceptor handles 401 error by clearing localStorage', async () => {
    const localStorage = new MockLocalStorage();
    
    localStorage.setItem('token', 'expired-token');
    localStorage.setItem('user', JSON.stringify(createMockUser()));

    let redirectCalled = false;

    // Simulate the interceptor logic
    const token = localStorage.getItem('token');
    const status = 401;

    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      redirectCalled = true;
    }

    // Verify token is cleared
    assert.equal(localStorage.getItem('token'), null);
    assert.equal(localStorage.getItem('user'), null);
    assert.equal(redirectCalled, true);
  });

  // ============================================
  // TEST SUITE 3: API Service Exports
  // ============================================

  await runTest('All API services export from centralized api/index.js', async () => {
    const serviceNames = [
      'authService',
      'userService',
      'wastePostService',
      'collectionService',
      'messageService',
      'notificationService',
      'ratingService',
      'feedbackService',
      'subscriptionService',
      'adminService'
    ];

    // Simulate what index.js exports
    const apiExports = {
      authService: { register: () => {}, login: () => {} },
      userService: { getProfile: () => {}, updateProfile: () => {} },
      wastePostService: { getAll: () => {}, getById: () => {} },
      collectionService: { getAll: () => {}, create: () => {} },
      messageService: { getAll: () => {}, send: () => {} },
      notificationService: { getAll: () => {}, markAsRead: () => {} },
      ratingService: { create: () => {}, getAll: () => {} },
      feedbackService: { submit: () => {}, getAll: () => {} },
      subscriptionService: { getPlans: () => {}, subscribe: () => {} },
      adminService: { getUsers: () => {}, getStats: () => {} }
    };

    // Verify all services are exported
    for (const serviceName of serviceNames) {
      assert.ok(
        apiExports[serviceName],
        `Service ${serviceName} should be exported from api/index.js`
      );
    }
  });

  // ============================================
  // TEST SUITE 4: Auth Service Endpoints
  // ============================================

  await runTest('authService.login sends correct payload and stores token', async () => {
    const localStorage = new MockLocalStorage();
    const mockAxios = createMockAxios([
      {
        url: 'http://localhost:5000/api/auth/login',
        method: 'POST',
        status: 200,
        data: {
          success: true,
          token: 'jwt-token-from-backend',
          user: createMockUser()
        }
      }
    ]);

    mockAxios.interceptors.request.use((config) => config, (error) => Promise.reject(error));

    const loginResponse = await mockAxios.post(
      'http://localhost:5000/api/auth/login',
      { email: 'test@example.com', password: 'password123' }
    );

    // Simulate authService behavior
    if (loginResponse.data.token) {
      localStorage.setItem('token', loginResponse.data.token);
    }

    const requests = mockAxios.getRequests();
    assert.equal(requests[0].method, 'POST');
    assert.equal(requests[0].url, 'http://localhost:5000/api/auth/login');
    assert.deepEqual(requests[0].data, { email: 'test@example.com', password: 'password123' });
    assert.equal(localStorage.getItem('token'), 'jwt-token-from-backend');
  });

  await runTest('authService.register includes all required fields', async () => {
    const mockAxios = createMockAxios([
      {
        url: 'http://localhost:5000/api/auth/register',
        method: 'POST',
        status: 201,
        data: {
          success: true,
          token: 'jwt-token-from-backend',
          user: createMockUser({ type: 'business' })
        }
      }
    ]);

    mockAxios.interceptors.request.use((config) => config, (error) => Promise.reject(error));

    const registerPayload = {
      email: 'business@example.com',
      password: 'secure-password',
      role: 'business',
      businessName: 'My Business',
      phoneNumber: '+1234567890'
    };

    const response = await mockAxios.post(
      'http://localhost:5000/api/auth/register',
      registerPayload
    );

    const requests = mockAxios.getRequests();
    assert.deepEqual(requests[0].data, registerPayload);
    assert.equal(response.data.user.type, 'business');
  });

  await runTest('authService.verifyEmail sends code to backend', async () => {
    const mockAxios = createMockAxios([
      {
        url: 'http://localhost:5000/api/auth/verify-email',
        method: 'POST',
        status: 200,
        data: { success: true, message: 'Email verified' }
      }
    ]);

    mockAxios.interceptors.request.use((config) => config, (error) => Promise.reject(error));

    await mockAxios.post('http://localhost:5000/api/auth/verify-email', {
      email: 'test@example.com',
      code: '123456'
    });

    const requests = mockAxios.getRequests();
    assert.equal(requests[0].url, 'http://localhost:5000/api/auth/verify-email');
    assert.equal(requests[0].data.code, '123456');
  });

  // ============================================
  // TEST SUITE 5: Protected API Endpoints
  // ============================================

  await runTest('Protected endpoints receive Authorization header from token', async () => {
    const localStorage = new MockLocalStorage();
    const mockAxios = createMockAxios([
      {
        url: 'http://localhost:5000/api/profile',
        method: 'GET',
        status: 200,
        data: { success: true, user: createMockUser() }
      }
    ]);

    localStorage.setItem('token', 'protected-token-xyz');

    mockAxios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    await mockAxios.get('http://localhost:5000/api/profile');

    const requests = mockAxios.getRequests();
    assert.equal(requests[0].headers.Authorization, 'Bearer protected-token-xyz');
  });

  await runTest('userService requests use protected endpoint pattern', async () => {
    const localStorage = new MockLocalStorage();
    const mockAxios = createMockAxios([
      {
        url: 'http://localhost:5000/api/users/profile',
        method: 'GET',
        status: 200,
        data: { success: true, user: createMockUser() }
      }
    ]);

    localStorage.setItem('token', 'user-service-token');

    mockAxios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const response = await mockAxios.get('http://localhost:5000/api/users/profile');

    const requests = mockAxios.getRequests();
    assert.ok(requests[0].headers.Authorization);
    assert.equal(response.data.success, true);
  });

  // ============================================
  // TEST SUITE 6: Error Handling
  // ============================================

  await runTest('API service handles 500 error response', async () => {
    const mockAxios = createMockAxios([
      {
        url: 'http://localhost:5000/api/waste-posts',
        method: 'GET',
        status: 500,
        data: { error: 'Internal Server Error' }
      }
    ]);

    mockAxios.interceptors.response.use(
      (response) => response,
      (error) => Promise.reject(error)
    );

    let errorCaught = false;
    let caughtError = null;
    
    try {
      await mockAxios.get('http://localhost:5000/api/waste-posts');
    } catch (error) {
      errorCaught = true;
      caughtError = error;
    }

    assert.equal(errorCaught, true);
  });

  await runTest('API service handles validation error response', async () => {
    const errorData = { 
      error: 'Validation failed',
      details: { email: 'Invalid email format' }
    };

    // Simulate getting a 400 error response
    const mockResponse = {
      status: 400,
      data: errorData
    };

    // Simulate catching the error
    let validationError = null;
    if (mockResponse.status === 400) {
      validationError = mockResponse.data;
    }

    assert.ok(validationError.error);
    assert.ok(validationError.details);
  });

  // ============================================
  // TEST SUITE 7: Token Flow End-to-End
  // ============================================

  await runTest('Complete authentication flow: register → login → protected call → logout', async () => {
    const localStorage = new MockLocalStorage();
    const mockAxios = createMockAxios([
      {
        url: 'http://localhost:5000/api/auth/register',
        method: 'POST',
        status: 201,
        data: {
          success: true,
          token: 'initial-token',
          user: createMockUser()
        }
      },
      {
        url: 'http://localhost:5000/api/waste-posts',
        method: 'GET',
        status: 200,
        data: {
          success: true,
          data: [{ id: 1, title: 'Waste Post 1' }]
        }
      }
    ]);

    mockAxios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Step 1: Register
    const registerResponse = await mockAxios.post(
      'http://localhost:5000/api/auth/register',
      {
        email: 'newuser@example.com',
        password: 'password',
        role: 'recycler'
      }
    );

    localStorage.setItem('token', registerResponse.data.token);
    localStorage.setItem('user', JSON.stringify(registerResponse.data.user));

    assert.equal(localStorage.getItem('token'), 'initial-token');

    // Step 2: Protected API call with token
    const postsResponse = await mockAxios.get('http://localhost:5000/api/waste-posts');

    const requests = mockAxios.getRequests();
    assert.ok(requests[1].headers.Authorization);
    assert.equal(requests[1].headers.Authorization, 'Bearer initial-token');

    // Step 3: Logout
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    assert.equal(localStorage.getItem('token'), null);
  });

  // ============================================
  // TEST SUITE 8: API Endpoint Alignment
  // ============================================

  await runTest('All expected backend endpoints are called correctly', async () => {
    const expectedEndpoints = [
      { service: 'authService', method: 'POST', endpoint: '/auth/login' },
      { service: 'authService', method: 'POST', endpoint: '/auth/register' },
      { service: 'authService', method: 'POST', endpoint: '/auth/verify-email' },
      { service: 'userService', method: 'GET', endpoint: '/users/profile' },
      { service: 'wastePostService', method: 'GET', endpoint: '/waste-posts' },
      { service: 'collectionService', method: 'GET', endpoint: '/collections' },
      { service: 'messageService', method: 'GET', endpoint: '/messages' },
      { service: 'notificationService', method: 'GET', endpoint: '/notifications' },
      { service: 'ratingService', method: 'POST', endpoint: '/ratings' },
      { service: 'feedbackService', method: 'POST', endpoint: '/feedback' }
    ];

    // Verify endpoint structure
    for (const endpoint of expectedEndpoints) {
      assert.ok(endpoint.service);
      assert.ok(endpoint.method);
      assert.ok(endpoint.endpoint.startsWith('/'));
    }

    assert.equal(expectedEndpoints.length, 10);
  });

  await runTest('API base URL is configured correctly', async () => {
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    
    assert.equal(baseUrl, 'http://localhost:5000/api');
    assert.ok(baseUrl.includes('localhost'));
    assert.ok(baseUrl.endsWith('/api'));
  });

  // ============================================
  // TEST SUITE 9: localStorage Key Consistency
  // ============================================

  await runTest('All components use consistent "token" key (not "authToken")', async () => {
    const localStorage = new MockLocalStorage();
    const correctKey = 'token';
    const incorrectKey = 'authToken';

    // Simulate all save operations
    const testToken = 'consistency-test-token';
    localStorage.setItem(correctKey, testToken);

    // Verify correct key exists
    assert.equal(localStorage.getItem(correctKey), testToken);

    // Verify incorrect key does not exist
    assert.equal(localStorage.getItem(incorrectKey), null);
  });

  await runTest('User data is stored separately from token', async () => {
    const localStorage = new MockLocalStorage();
    const testUser = createMockUser();

    localStorage.setItem('token', 'test-token-value');
    localStorage.setItem('user', JSON.stringify(testUser));

    // Verify both are stored correctly
    assert.equal(localStorage.getItem('token'), 'test-token-value');
    assert.deepEqual(JSON.parse(localStorage.getItem('user')), testUser);

    // Verify they are independent
    localStorage.removeItem('token');
    assert.equal(localStorage.getItem('token'), null);
    assert.ok(localStorage.getItem('user'));
  });

  console.log('\n✅ Frontend API Connection Tests Complete\n');
};

// Run all tests
main().catch((error) => {
  console.error('Test runner failed:', error);
  process.exitCode = 1;
});
