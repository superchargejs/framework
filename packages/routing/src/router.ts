'use strict'

import { Route } from './route'
import KoaRouter from '@koa/router'
import { RouteGroup } from './group'
import Collect from '@supercharge/collections'
import { PendingRoute } from './pending-route'
import { tap, upon } from '@supercharge/goodies'
import { isFunction } from '@supercharge/classes'
import { RouteCollection } from './route-collection'
import { Request, Response } from '@supercharge/http'
import { HttpRouter, RouteHandler, RouteAttributes, HttpMethod, MiddlewareCtor, NextHandler, HttpContext, Middleware, Application } from '@supercharge/contracts'

export class Router implements HttpRouter {
  private readonly meta: {
    /**
     * Stores the app instance.
     */
    app: Application

    /**
     * Stores the list of routes.
     */
    instance: KoaRouter

    /**
     * Stores the list of routes.
     */
    routes: RouteCollection

    /**
     * Stores the named route middleware.
     */
    middleware: { [name: string]: MiddlewareCtor }

    /**
     * Stores the opened route groups.
     */
    groupStack: RouteGroup[]
  }

  /**
   * Create a new router instance.
   */
  constructor (app: Application) {
    this.meta = {
      app,
      groupStack: [],
      middleware: {},
      instance: new KoaRouter(),
      routes: new RouteCollection()
    }
  }

  /**
   * Returns the app instance.
   *
   * @returns {Application}
   */
  private app (): Application {
    return this.meta.app
  }

  /**
   * Returns the Koa router instance.
   *
   * @returns {KoaRouter}
   */
  private router (): KoaRouter {
    return this.meta.instance
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
   * Returns a middleware-function for the HTTP server which handles
   * the route-matching for an incoming request to the server.
   *
   * @returns {Function}
   */
  createRoutingMiddleware (): any {
    return upon(this.registerRoutesToRouter(), () => {
      return this.router().middleware()
    })
  }

  /**
   * Register all collected routes to the router instance.
   */
  private registerRoutesToRouter (): void {
    this.routes().all().forEach(route => {
      this.register(route)
    })
  }

  /**
   * Register the given `route` and related route-level middleware to the router.
   *
   * @param route Route
   */
  private register (route: Route): void {
    this.router().register(route.path(), route.methods(), [
      ...this.createRouteMiddleware(route),

      async (ctx: any, next: NextHandler) => {
        await route.run(this.createContext(ctx))
        await next()
      }
    ], { name: route.path() })
  }

  /**
   * Creates and returns the route-level middleware stack.
   *
   * @param route Route
   *
   * @returns {Function[]}
   */
  private createRouteMiddleware (route: Route): any[] {
    return route.getMiddleware().map(name => {
      this.ensureMiddlewareExists(name)

      return async (ctx: any, next: NextHandler) => {
        return this.getMiddleware(name).handle(
          this.createContext(ctx), next
        )
      }
    })
  }

  /**
   * Throws if the given middleware `name` is not registered in the middleware stack.
   *
   * @param name String
   *
   * @throws
   */
  ensureMiddlewareExists (name: string): void {
    if (!this.hasMiddleware(name)) {
      throw new Error(`Route-level middleware "${name}" is not registered in your HTTP kernel`)
    }
  }

  /**
   * Determine whether the given middleware is registered.
   *
   * @param name String
   *
   * @returns {Boolean}
   */
  hasMiddleware (name: string): boolean {
    return !!this.getMiddleware(name)
  }

  /**
   * Returns a new middleware instance.
   *
   * @param name String
   *
   * @returns {Middleware}
   */
  private getMiddleware (name: string): Middleware {
    if (this.meta.middleware[name]) {
      return new (this.meta.middleware[name])()
    }

    throw new Error(`Missing middleware "${name}". Configure it in your HTTP kernel`)
  }

  /**
   * Wrap the given Koa `ctx` into a Supercharge ctx.
   *
   * @param ctx
   *
   * @returns {HttpContext}
   */
  private createContext (ctx: any): HttpContext {
    return {
      raw: ctx,
      request: new Request(ctx),
      response: new Response(ctx.response)
    }
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
  get (path: string, handler: RouteHandler, middleware?: string[]): Route {
    return this.addRoute(['get', 'head'], path, handler, middleware)
  }

  /**
   * Create a POST route.
   *
   * @param path String
   * @param handler RouteHandler
   *
   * @returns {Route}
   */
  post (path: string, handler: RouteHandler, middleware?: string[]): Route {
    return this.addRoute(['post'], path, handler, middleware)
  }

  /**
   * Create a PUT route.
   *
   * @param path String
   * @param handler RouteHandler
   *
   * @returns {Route}
   */
  put (path: string, handler: RouteHandler, middleware?: string[]): Route {
    return this.addRoute(['put'], path, handler, middleware)
  }

  /**
   * Create a DELETE route.
   *
   * @param path String
   * @param handler RouteHandler
   *
   * @returns {Route}
   */
  delete (path: string, handler: RouteHandler, middleware?: string[]): Route {
    return this.addRoute(['delete'], path, handler, middleware)
  }

  /**
   * Create a PATCH route.
   *
   * @param path String
   * @param handler RouteHandler
   *
   * @returns {Route}
   */
  patch (path: string, handler: RouteHandler, middleware?: string[]): Route {
    return this.addRoute(['patch'], path, handler, middleware)
  }

  /**
   * Create an OPTIONS route.
   *
   * @param path String
   * @param handler RouteHandler
   *
   * @returns {Route}
   */
  options (path: string, handler: RouteHandler): Route {
    return this.addRoute(['options'], path, handler)
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
  addRoute (methods: HttpMethod[], path: string, handler: RouteHandler, middleware?: string[]): Route {
    return tap(this.createRoute(methods, path, handler, middleware), route => {
      return this.routes().add(route)
    })
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
  createRoute (methods: HttpMethod[], path: string, handler: RouteHandler, middleware?: string[]): Route {
    const route = new Route(methods, path, handler, this.app()).middleware(middleware)

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
  group (path: string): void
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
     * Process the path to a routes file or the callback to register routes or nested route groups to the router.
     */
    if (typeof attributes === 'string') {
      this.loadRoutesFrom(attributes)
    } else {
      callback()
    }

    /*
     * Now that the callback is processed, remove this group from the stack.
     */
    this.groupStack().pop()
  }

  /**
   * Load routes from the given route file `path`.
   *
   * @param path
   */
  private loadRoutesFrom (path: string): void {
    require(path)
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
  middleware (middleware: string): PendingRoute {
    return new PendingRoute(this).middleware(middleware)
  }

  /**
   * Register a named middleware.
   *
   * @param name string
   * @param Middleware class
   *
   * @returns {Router}
   */
  registerAliasMiddleware (name: string, Middleware: MiddlewareCtor): Router {
    return tap(this, () => {
      this.meta.middleware[name] = Middleware
    })
  }
}
