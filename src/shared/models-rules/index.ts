import { AppRequest } from '../models';

/**
 * @param {AppRequest} request
 * @returns {string}
 */
export function getUserIdFromRequest(request: AppRequest): string {
  // return request.user && request.user.id;
  return '2cf9ee55-56b2-4b15-965f-c08e8d50675d';
}
