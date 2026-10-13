import type { HandlerEvent } from '@netlify/functions'

/**
 * Name of the operation a request is asking for, read from the `function`
 * query parameter. `fn` is accepted as an alias (the original `login` name).
 */
export function getFunctionName(event: HandlerEvent): string | undefined {
  const params = event.queryStringParameters || {}
  return params['function'] || params['fn']
}
