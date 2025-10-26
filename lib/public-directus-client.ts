import { createDirectus, rest } from '@directus/sdk';
import { getDirectusUrl, getEnvironmentStatus } from './env-config';
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
const envStatus = getEnvironmentStatus();

console.log('[public-directus-client.ts] Environment Status:', JSON.stringify(envStatus, null, 2));
console.log('[public-directus-client.ts] Creating public client for:', directusUrl);
console.log('[public-directus-client.ts] NODE_ENV:', process.env.NODE_ENV);
console.log('[public-directus-client.ts] DEPLOYMENT_ENV:', process.env.DEPLOYMENT_ENV);
console.log('[public-directus-client.ts] RENDER:', process.env.RENDER);

export const publicDirectus = createDirectus<DirectusSchema>(directusUrl)
  .with(rest());
