
declare module '@ioc:supercharge/route' {
  import { HttpRouter } from '@supercharge/contracts'

  export interface ContainerBindings {
    'supercharge/route': HttpRouter
  }

  const Route: HttpRouter
  export default Route
}
