// Material Module
// Exports routes, controller, and service for the material feature

import router from './material.routes';
import * as controller from './material.controller';
import * as service from './material.service';

export { router };
export { controller };
export { service };

export default { router, controller, service };
