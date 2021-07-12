'use strict'

import { IncomingHttpHeaders } from 'http'
import { InteractsWithContentTypes } from './concerns'

export interface HttpRequest extends InteractsWithContentTypes {
  /**
   * Returns the query parameters.
   */
  query: Record<string, any>

  /**
   * Returns the path parameters.
   */
  params: Record<string, any>

  /**
   * Returns the request payload.
   */
  payload: any

  /**
   * Returns the request headers.
   */
  headers: IncomingHttpHeaders

  /**
   * Returns the request header identified by the given `key`. The default
   * value will be returned if no header is present for the given key.
   */
  header(key: string, defaultValue?: any): string | undefined

  /**
   * Determine whether the request contains a header with the given `key`.
   */
  hasHeader(key: string): boolean

  /**
   * Returns the request method.
   */
  method (): string

  /**
   * Determine whether the request has the given `method`.
   */
  isMethod (method: string): boolean

  /**
   * Returns the request’s URL path.
   */
  path (): string

  /**
   * Returns the client IP address.
   */
  ip (): string

  /**
   * Returns the client user agent.
   */
  userAgent (): string

  /**
   * Returns a bearer token from the request headers.
   */
  bearerToken (): string

  /**
   * Returns the cookie value identified by `key`. The default value
   * will be returned if no cookie is present for the given key.
   */
  cookie(key: string, defaultValue?: string): any

  /**
   * Determine whether the request contains a cookie with the given `key`.
   */
  hasCookie(key: string): boolean

  /**
   * Returns the request’s full URL.
   */
  fullUrl(): string

  /**
   * Determine whether the request is over HTTPS.
   */
  isSecure(): boolean
}
