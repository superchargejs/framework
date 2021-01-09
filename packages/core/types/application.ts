
declare module '@ioc:supercharge/app' {
  import { Application, ConfigStore, EnvStore, Logger } from '@supercharge/contracts'

  export interface ContainerBindings {
    'supercharge/app': Application
    'supercharge/config': ConfigStore
    'supercharge/env': EnvStore
    'supercharge/logger': Logger
  }

  const App: Application
  export default App
}
