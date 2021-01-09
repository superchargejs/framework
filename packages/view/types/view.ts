
declare module '@ioc:supercharge/view' {
  import { ViewEngine } from '@supercharge/contracts'

  export interface ContainerBindings {
    'supercharge/view': ViewEngine
  }

  const View: ViewEngine
  export default View
}
