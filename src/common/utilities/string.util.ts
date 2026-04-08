import slugify from 'slugify';
import { randomBytes } from 'crypto';

export function camelCaseToSnakeCase(s: string): string {
  return s.replace(/([A-Z])/g, (letter) => `_${letter.toLowerCase()}`);
}

export function getSlug(s: string): string {
  return slugify(s, {
    locale: 'vi',
    lower: true,
    remove: undefined,
    replacement: '-',
    strict: true,
    trim: true,
  });
}
/**
 * Generate a base64url token and return the first `length` characters.
 */
export function generateBase64UrlToken(length = 9): string {
  const buf = randomBytes(12);
  const s = buf
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  return s.slice(0, length);
}
