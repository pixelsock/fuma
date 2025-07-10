import { getCategories, getCategorizedArticles } from './directus-source';

/**
 * Simple function to get Directus navigation data without complex source merging
 */
export async function getDirectusNavigation() {
  try {
    const [categories, categorizedArticles] = await Promise.all([
      getCategories(),
      getCategorizedArticles()
    ]);

    return categories.map(category => ({
      name: category.name,
      slug: category.slug,
      description: category.description,
      order: category.order,
      articles: (categorizedArticles.get(category.id) || []).map(article => ({
        name: article.name,
        slug: article.slug,
        description: article.description,
        url: `/docs/${article.slug}`
      }))
    }));
  } catch (error) {
    console.error('Error fetching Directus navigation:', error);
    return [];
  }
}