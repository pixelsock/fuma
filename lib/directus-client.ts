import { createDirectus, rest, staticToken, authentication } from '@directus/sdk';
import { 
  getDirectusConfig, 
  getDirectusUrl, 
  getDirectusToken, 
  getDirectusCredentials,
  getEnvironmentStatus 
} from './env-config';

// Directus types
export interface DirectusArticle {
  id: string;
  name: string;
  title?: string;
  description?: string;
  content: string;
  slug: string;
  status: string;
  category?: { key: string; name: string } | null;
  order?: number;
  sort?: number; // Sort order field
  pdf?: string; // PDF file reference (lowercase for compatibility)
  PDF?: string | { id: string; filename_download: string } | null; // Actual field from Directus (uppercase)
}

export interface DirectusCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  order?: number;
  color?: string;
}

export interface DirectusSiteSetting {
  id: string;
  key: string;
  value?: string;
  description?: string;
  image?: string;
}

export interface DirectusGlobalSettings {
  id: number;
  user_updated?: string | null;
  date_updated?: string | null;
  logo?: string;
}

export interface DirectusHomePage {
  id: number;
  header_text: string;
  header_description: string;
  header_buttons: Array<{
    button_text: string;
    link: string;
    icon: string;
  }>;
  key_resources: Array<{
    icon: string;
    title: string;
    description: string;
    url: string;
    category?: string | null;
  }>;
  updates: Array<{
    date: string;
    title: string;
    description: string;
  }>;
  faqs: Array<{
    question: string;
    answer: string;
  }>;
}

export interface DirectusSupportingDocument {
  id: string;
  title: string;
  status: 'available' | 'in_development' | 'pending';
  managed_by?: string;
  link?: string;
  file?: string;
}

export interface DirectusSupportingDocumentsPage {
  id: number;
  page_title: string;
  page_description: string;
}

export interface DirectusAdvisoryCommitteePage {
  id: number;
  page_title: string;
  page_description: string;
  membership_description?: string;
  uac_members: Array<{
    name: string;
    organization: string;
    additional_details?: string;
  }>;
}

export interface DirectusVersionsPage {
  id: number;
  page_title: string;
  page_description: string;
  available_versions: Array<{
    amended_date: string;
    link_type: 'file' | 'link';
    file_id?: string;
    title?: string;
    external_link?: string;
    is_current?: boolean;
  }>;
  important_notes: string;
  additional_resources: Array<{
    title: string;
    url: string;
    icon?: string;
  }>;
  current_version: string;
}

export interface DirectusWhatIsUdoPage {
  id: number;
  page_title: string;
  page_description: string;
  video_url?: string;
  video_title?: string;
  video_description?: string;
  alert_title?: string;
  alert_content?: string;
  key_features: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
}

export interface DirectusSchema {
  articles: DirectusArticle[];
  article_categories: DirectusCategory[];
  settings: DirectusSiteSetting[];
  global_settings: DirectusGlobalSettings[];
  home_page: DirectusHomePage[];
  supporting_documents: DirectusSupportingDocument[];
  supporting_documents_page: DirectusSupportingDocumentsPage;
  advisory_committee_page: DirectusAdvisoryCommitteePage;
  versions_page: DirectusVersionsPage;
  what_is_udo_page: DirectusWhatIsUdoPage;
}

// Get configuration using the environment utility
const directusConfig = getDirectusConfig();
const directusUrl = directusConfig.url;
const directusToken = directusConfig.token;

// Log environment status for debugging
const envStatus = getEnvironmentStatus();
console.log('[lib/directus-client.ts] Environment Status:', envStatus);
console.log('[lib/directus-client.ts] Directus URL:', directusUrl);
console.log('[lib/directus-client.ts] Token configured:', directusToken ? `${directusToken.substring(0, 10)}...` : 'not set');
console.log('[lib/directus-client.ts] Environment type:', typeof window === 'undefined' ? 'server' : 'client');

// Create client with static token if available, otherwise use authentication
export const directus = createDirectus<DirectusSchema>(directusUrl)
  .with(rest())
  .with(directusToken ? staticToken(directusToken) : authentication());

// Helper to ensure authentication
export async function ensureAuthenticated(): Promise<boolean> {
  console.log('[directus-client.ts] ensureAuthenticated called');
  
  // If using static token, we're already authenticated
  if (directusToken) {
    console.log('[directus-client.ts] Using static token authentication');
    return true;
  }
  
  // If using email/password authentication
  const credentials = getDirectusCredentials();
  const { email: directusEmail, password: directusPassword } = credentials;
  
  console.log('[directus-client.ts] Email configured:', !!directusEmail);
  console.log('[directus-client.ts] Password configured:', !!directusPassword);
  
  if (!directusEmail || !directusPassword) {
    console.warn('[directus-client.ts] Directus credentials not configured. Skipping Directus content.');
    return false;
  }
  
  try {
    console.log('[directus-client.ts] Attempting to authenticate with Directus...');
    // Type assertion to access login method when using authentication
    const authClient = directus as any;
    await authClient.login({ email: directusEmail, password: directusPassword });
    console.log('[directus-client.ts] Successfully authenticated with Directus');
    return true;
  } catch (error) {
    console.error('[directus-client.ts] Failed to authenticate with Directus:', error);
    return false;
  }
}

