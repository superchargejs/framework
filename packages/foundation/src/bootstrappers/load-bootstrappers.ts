'use strict'

import { Bootstrapper, Application } from '@supercharge/contracts'

export class LoadBootstrappers implements Bootstrapper {
  /**
   * Run the `bootstrap` method on all application providers
   * configured in the `bootstrap/app` directory.
   *
   * @param app
   */
  async bootstrap (app: Application) {
    return app.loadConfiguredBootstrappers()
  }
}
