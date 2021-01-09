'use strict'

import { Class } from '../support'
import { Application } from '../foundation'

export interface Container<ContainerBindings extends any = any> {
  /**
   * Register a binding in the container.
   *
   * @param {String} namespace
   * @param {Function} factory
   */
  bind (namespace: string, factory: () => any): this

  /**
   * Register a shared binding (singleton) in the container.
   *
   * @param {String} namespace
   * @param {Function} factory
   */
  singleton (namespace: string, factory: (container: Container) => any): this

  /**
   * Determine whether the given namespace is bound in the container.
   *
   * @param {String} namespace
   */
  hasBinding (namespace: string): boolean

  /**
   * Resolve the given namespace from the container.
   *
   * @param {String} namespace
   */
  make<Namespace extends Extract<keyof ContainerBindings, string>> (namespace: Namespace): ContainerBindings[Namespace]
  make<T> (namespace: string | Class<T, [Application]>): T

  /**
   * Flush all bindings and resolved instances from the containter.
   */
  flush (): this
}
