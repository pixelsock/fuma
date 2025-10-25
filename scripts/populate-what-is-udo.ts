import { directus, ensureAuthenticated } from '../lib/directus-client';
import { updateSingleton } from '@directus/sdk';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function populateWhatIsUDO() {
  try {
    console.log('🔑 Authenticating with Directus...');
    await ensureAuthenticated();
    console.log('✓ Authenticated');

    console.log('📝 Populating What is UDO page...');
    
    const result = await directus.request(
      updateSingleton('what_is_udo_page', {
        page_title: 'Charlotte Explorer',
        page_description: 'The Charlotte Unified Development Ordinance (UDO) is a comprehensive update to the city\'s development regulations that guides how land is used and developed throughout Charlotte. Adopted on August 22, 2022, and effective June 1, 2023, the UDO replaces the previous zoning ordinance with modern, place-based regulations that support the community\'s vision for growth.',
        video_url: 'https://www.youtube.com/embed/FQ5TDuiSnZo',
        video_title: 'Learn About the UDO',
        video_description: 'Watch this introductory video to understand the basics of Charlotte\'s Unified Development Ordinance',
        alert_title: 'Why a Unified Development Ordinance?',
        alert_content: 'The UDO consolidates multiple ordinances into a single, user-friendly document that aligns development regulations with Charlotte\'s adopted plans and policies, including the Charlotte Future 2040 Comprehensive Plan.',
        key_features: [
          {
            icon: 'map',
            title: 'Place Types',
            description: 'Guided by a new approach to policy that focuses on the character and form of development rather than just land use.'
          },
          {
            icon: 'domain',
            title: 'Unified Standards',
            description: 'Combines zoning, subdivision, streets, and other development standards into one comprehensive document.'
          },
          {
            icon: 'park',
            title: 'Environmental Protection',
            description: 'Enhanced tree protection, stormwater management, and environmental standards.'
          },
          {
            icon: 'directions_bus',
            title: 'Transit-Oriented Development',
            description: 'Encourages development near transit stations and along transit corridors.'
          },
          {
            icon: 'home',
            title: 'Neighborhood Protection',
            description: 'Provides options for protection of existing neighborhood character while also allowing for needed housing supply.'
          },
          {
            icon: 'verified_user',
            title: 'Predictable Process',
            description: 'Clear and predictable development review process with defined timelines and expectations.'
          }
        ],
        learn_more_links: [
          {
            icon: 'menu_book',
            title: 'Browse UDO Articles',
            description: 'Search and explore all UDO articles by category',
            url: '/articles-listing'
          },
          {
            icon: 'groups',
            title: 'UDO University',
            description: 'Virtual training sessions on the UDO',
            url: '/articles/udo-university'
          },
          {
            icon: 'map',
            title: 'Charlotte Explorer',
            description: 'Use Charlotte Explorer to learn more about your zoning and more.',
            url: '/articles/zoning-map'
          },
          {
            icon: 'download',
            title: 'Previous UDO Versions',
            description: 'Access historical and past versions of the UDO',
            url: '/versions'
          },
          {
            icon: 'description',
            title: 'Text Amendments',
            description: 'Track ongoing updates and amendments to the UDO',
            url: '/text-amendments'
          },
          {
            icon: 'groups',
            title: 'Advisory Committee',
            description: 'Learn about UAC membership and meeting information',
            url: '/advisory-committee'
          }
        ],
        quick_facts: [
          {
            value: 'June 1, 2023',
            label: 'Effective Date'
          },
          {
            value: '600+',
            label: 'Pages of Regulations'
          },
          {
            value: '29',
            label: 'Zoning Districts'
          }
        ]
      })
    );

    console.log('✓ Successfully populated What is UDO page');
    console.log('View at: http://localhost:8056/admin/content/what_is_udo_page');
    console.log('\nData:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

populateWhatIsUDO();
