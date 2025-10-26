import { createDirectus, rest } from '@directus/sdk';
import { getDirectusUrl } from './env-config';
import type { DirectusSchema } from './directus-client';

/**
 * Public Directus client - no authentication required
 * Use this for publicly accessible singleton collections:
 * - what_is_udo_page
 * - versions_page
 * - supporting_documents_page
 * - advisory_committee_page
 */
const directusUrl = getDirectusUrl();

console.log('[public-directus-client.ts] Creating public client for:', directusUrl);

export const publicDirectus = createDirectus<DirectusSchema>(directusUrl)
  .with(rest());
