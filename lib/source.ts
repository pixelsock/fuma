import { directusOnlySource } from './directus-only-source';

// Use Directus-only source to avoid fs module issues
export const source = directusOnlySource;
