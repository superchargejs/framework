'use strict'

import { Route } from './route'
import { RouteGroup } from './group'
import Collect from '@supercharge/collections'
import { PendingRoute } from './pending-route'
import { isFunction } from '@supercharge/classes'
import { RouteCollection } from './route-collection'
import { HttpRouter, RouteHandler, RouteAttributes, HttpMethod } from '@supercharge/contracts'

export class Router implements HttpRouter {
  private readonly meta: {
    /**
     * Stores the list of routes.
     */
    routes: RouteCollection

    /**
     * Stores the opened route groups.
     */
    groupStack: RouteGroup[]
  }

  /**
   * Create a new router instance.
   */
  constructor () {
    this.meta = { groupStack: [], routes: new RouteCollection() }
  }

  /**
   * Returns the route collection.
   *
   * @returns {RouteCollection}
   */
  routes (): RouteCollection {
    return this.meta.routes
  }

  /**
   * Returns the route group stack.
   *
   * @returns {RouteGroup[]}
   */
  groupStack (): RouteGroup[] {
    return this.meta.groupStack
  }

  /**
   * Create a GET route.
   *
   * @param path String
   * @param handler RouteHandler
   *
   * @returns {Route}
   */
  get (path: string, handler: RouteHandler): void {
    this.addRoute(['get', 'head'], path, handler)
  }

  /**
   * Create a POST route.
   *
   * @param path String
   * @param handler RouteHandler
   *
   * @returns {Route}
   */
  post (path: string, handler: RouteHandler): void {
    this.addRoute(['post'], path, handler)
  }

  /**
   * Create a PUT route.
   *
   * @param path String
   * @param handler RouteHandler
   *
   * @returns {Route}
   */
  put (path: string, handler: RouteHandler): void {
    this.addRoute(['put'], path, handler)
  }

  /**
   * Create a DELETE route.
   *
   * @param path String
   * @param handler RouteHandler
   *
   * @returns {Route}
   */
  delete (path: string, handler: RouteHandler): void {
    this.addRoute(['delete'], path, handler)
  }

  /**
   * Create a PATCH route.
   *
   * @param path String
   * @param handler RouteHandler
   *
   * @returns {Route}
   */
  patch (path: string, handler: RouteHandler): void {
    this.addRoute(['patch'], path, handler)
  }

  /**
   * Create an OPTIONS route.
   *
   * @param path String
   * @param handler RouteHandler
   *
   * @returns {Route}
   */
  options (path: string, handler: RouteHandler): void {
    this.addRoute(['options'], path, handler)
  }

  /**
   * Create a new route and add it to the routes collection.
   *
   * @param method HttpMethod
   * @param path String
   * @param handler RouteHandler
   *
   * @returns {Route}
   */
  addRoute (methods: HttpMethod[], path: string, handler: RouteHandler): void {
    this.routes().add(
      this.createRoute(methods, path, handler)
    )
  }

  /**
   * Create a new route instance.
   *
   * @param method HttpMethod
   * @param path String
   * @param handler RouteHandler
   *
   * @returns {Route}
   */
  createRoute (methods: HttpMethod[], path: string, handler: RouteHandler): Route {
    const route = new Route(methods, path, handler)

    if (this.hasGroupStack()) {
      this.mergeGroupAttributesIntoRoute(route)
    }

    return route
  }

  /**
   * Determine whether an active route group exists.
   *
   * @returns {Boolean}
   */
  hasGroupStack (): boolean {
    return Collect(this.getLastGroup()).isNotEmpty()
  }

  /**
   * Returns the last route group.
   *
   * @returns {RouteGroup | undefined}
   */
  getLastGroup (): RouteGroup | undefined {
    return Collect(this.groupStack()).last()
  }

  /**
   * Merge the group attributes into the given route.
   *
   * @param route
   */
  mergeGroupAttributesIntoRoute (route: Route): void {
    const group = this.getLastGroup()

    if (group) {
      route
        .prefix(group.prefix())
        .middleware(group.middleware())
    }
  }

  /**
   * Create a new route group.
   *
   * @param callback Function
   *
   * @returns {RouteGroup}
   */
  group (callback: () => void): void
  group (attributes: RouteAttributes, callback: () => void): void
  group (attributes: any, callback?: any): void {
    /**
     * If only a single argument is provided by the user, we expect it to be the
     * callback function. That’s the reason we’re reassigning the variables here.
     */
    if (isFunction(attributes)) {
      callback = attributes
      attributes = undefined
    }

    const group = new RouteGroup(attributes)

    /**
     * Keep track of the route group so that routes defined in the callback will
     * use the configured attributes (e.g., prefix, middleware) of the group.
     */
    this.groupStack().push(group)

    /*
     * Process the callback to register routes or nested route groups to the router.
     */
    callback()

    /*
     * Now that the callback is processed, remove this group from the stack.
     */
    this.groupStack().pop()
  }

  /**
   * Assign the given `prefix` to a route path or all routes defined in a route group.
   *
   * @param prefix String
   *
   * @returns PendingRoute
   */
  prefix (prefix: string): PendingRoute {
    return new PendingRoute(this).prefix(prefix)
  }

  /**
   * Assign the given `middleware` stack to a route or all routes defined in a route group.
   *
   * @param middleware String|String[]
   *
   * @returns PendingRoute
   */
  middleware (prefix: string): PendingRoute {
    return new PendingRoute(this).middleware(prefix)
  }
}