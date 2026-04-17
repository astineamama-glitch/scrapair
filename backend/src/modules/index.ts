// Module Registry - Central export point for all modules
// Each module exports its routes which will be mounted in the main server

// The structure below assumes each module has this export pattern:
// export { default as router } from './module.routes';

// After refactoring, import and mount routes like:
// import { authModule, userModule, ... } from './modules';
// app.use('/api/auth', authModule.router);
// app.use('/api/users', userModule.router);

// Placeholder - will be populated after module migrations
export const moduleRegistry = {
  // auth: null,        // Will import from './auth'
  // userProfile: null, // Will import from './user-profile'
  // material: null,    // Will import from './material'
  // // ... etc
};

// Export individual modules as they're created
// export * as authModule from './auth';
// export * as userModule from './user-profile';
// export * as materialModule from './material';
