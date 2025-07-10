import { createDirectus, rest, authentication } from '@directus/sdk';

export const directus = createDirectus(process.env.DIRECTUS_URL || 'https://admin.charlotteudo.org')
  .with(rest())
  .with(authentication());

export type Article = {
  id: string;
  name: string;
  content: string; // HTML content
  slug: string;
  order: number;
  category: { key: string; name: string };
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  order: number;
};
