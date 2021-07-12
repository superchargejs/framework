'use strict'

export interface InteractsWithContentTypes {
  /**
   * Determine whether the request is sending JSON payload.
   *
   * @example
   * ```
   * request.isJson()
   * ```
   */
  isJson (): boolean

  /**
   * Determine whether the request is asking for a JSON response.
   *
   * @example
   * ```
   * request.wantsJson()
   * ```
   */
  wantsJson (): boolean

  /**
   * Determine whether the request is asking for an HTML response.
   *
   * @example
   * ```
   * request.wantsHtml()
   * ```
   */
  wantsHtml (): boolean

  /**
   * Determine whether the request accepts a given content type.
   *
   * @example
   * ```
   * request.accepts('text/html')
   * request.accepts('text/html', 'application/json')
   * request.accepts(['text/html', 'application/json'])
   * ```
   */
  accepts(): boolean
  accepts(types: string[]): boolean
  accepts(...types: string[]): boolean

  /**
   * Return the most suitable content type for the request
   * from the given `types` based on content negotiation.
   *
   * @example
   * ```
   * request.prefers('text/html')
   * request.prefers('text/html', 'application/json')
   * request.prefers(['text/html', 'application/json'])
   *
   * // or
   *
   * switch (request.prefers('json', 'html', 'text')) {
   *   case 'json':
   *     return response.payload(user)
   *
   *   case 'html':
   *     return response.view('user/profile', { user })
   *
   *   case 'text': break;
   *     return user.toString()
   *
   *   default:
   *     // handle default case :)
   * }
   * ```
   */
  prefers(types: string[]): string | boolean
  prefers(...types: string[]): string | boolean
}
