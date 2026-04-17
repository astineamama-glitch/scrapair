// Module Structure Template
// Copy this pattern to each module directory:
// src/modules/{feature}/
//   ├── {feature}.routes.ts    (API routes)
//   ├── {feature}.controller.ts (Request handlers)
//   ├── {feature}.service.ts    (Business logic)
//   ├── {feature}.model.ts      (Database model)
//   └── index.ts               (Module exports)

// EXAMPLE - Material Module:
// src/modules/material/
//   ├── material.routes.ts
//   ├── material.controller.ts
//   ├── material.service.ts
//   ├── material.model.ts
//   └── index.ts (exports routes and controller)

// When creating each module:
// 1. Create the feature folder
// 2. Move controller from src/controllers/{feature}Controller.ts
// 3. Move routes from src/routes/{feature}Routes.ts
// 4. Move service logic from src/services/{feature}Service.ts
// 5. Move/reference model from src/models
// 6. Create index.ts that exports: module, routes, controller

// In index.ts:
// export { routes } from './{feature}.routes';
// export { controller } from './{feature}.controller';
