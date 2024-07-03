import { loggerToWinstonLogger } from '@backstage/backend-common';
import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { catalogServiceRef } from '@backstage/plugin-catalog-node/alpha';

import { createRouter } from './service/router';

export const rulesBackendPlugin = createBackendPlugin({
  pluginId: 'rules',
  register(env) {
    env.registerInit({
      deps: {
        logger: coreServices.logger,
        config: coreServices.rootConfig,
        discovery: coreServices.discovery,
        httpRouter: coreServices.httpRouter,
        urlReader: coreServices.urlReader,
        scheduler: coreServices.scheduler,
        catalogApi: catalogServiceRef,
      },
      async init({ logger, httpRouter }) {
        const log = loggerToWinstonLogger(logger);
        const router = await createRouter({
          logger: log,
        });
        httpRouter.use(router);
      },
    });
  },
});
