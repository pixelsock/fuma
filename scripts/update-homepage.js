#!/usr/bin/env node

// Use ES modules for TypeScript imports
import { directus, ensureAuthenticated } from '../lib/directus-client.js';
import { readItem, updateItem } from '@directus/sdk';

async function updateHomepage() {
  try {
    // Ensure authentication
    const isAuthenticated = await ensureAuthenticated();
    if (!isAuthenticated) {
      throw new Error('Failed to authenticate with Directus');
    }

    console.log('Connected to Directus');

    // Read current homepage data
    const currentData = await directus.request(readItem('home_page', 1));
    console.log('Current data:', JSON.stringify(currentData, null, 2));

    // Prepare updated data
    const updatedData = {
      key_resources: [
        {
          icon: 'book_ribbon',
          title: 'What is the UDO?',
          description: "Learn about Charlotte's Unified Development Ordinance and how it shapes our city's growth.",
          url: '/what-is-udo',
          category: 'Learn'
        },
        {
          icon: 'archive',
          title: 'UDO Versions',
          description: 'Access current and historical versions of the Charlotte Unified Development Ordinance.',
          url: '/versions',
          category: 'Archive'
        },
        {
          icon: 'description',
          title: 'Text Amendments',
          description: 'The UDO is a living document that continues to be updated through text amendments.',
          url: '/text-amendments',
          category: 'Ongoing'
        },
        {
          icon: 'school',
          title: 'UDO University',
          description: 'Virtual training opportunities and resources to learn about the UDO.',
          url: '/articles/udo-university',
          category: 'Learn'
        },
        {
          icon: 'place',
          title: 'Zoning Map',
          description: 'Interactive zoning map to check property zoning and regulations.',
          url: '/articles/zoning-map',
          category: 'Interactive'
        },
        {
          icon: 'search',
          title: 'Read UDO',
          description: 'Read the regulations and standards in the UDO',
          url: '/articles-listing',
          category: 'Learn'
        }
      ],
      updates: [
        {
          date: '2025-10-08',
          title: 'UDO Advisory Committee Meeting',
          description: 'The UAC met on October 8 to discuss an upcoming text amendment to the UDO'
        },
        {
          date: '2024-12-15',
          title: 'New Text Amendment Approved',
          description: 'City Council approved updates to residential density standards in urban core districts.'
        },
        {
          date: '2024-11-28',
          title: 'UDO University Session Scheduled',
          description: 'Join us for a virtual training on UDO regulations and procedures.'
        }
      ],
      faqs: [
        {
          question: 'What is the Charlotte UDO?',
          answer: "The Charlotte Unified Development Ordinance (UDO) is a comprehensive update to the city's zoning regulations. It combines and modernizes previous ordinances into a single, user-friendly document that guides development in Charlotte."
        },
        {
          question: 'When did the UDO become effective?',
          answer: 'The UDO became effective on June 1, 2023, replacing the previous zoning ordinance. All development applications submitted after this date for properties with new zoning districts are subject to these regulations.'
        },
        {
          question: "Has my property's zoning changed?",
          answer: "Many properties received new zoning designations under the UDO. You can check your property's zoning using our interactive zoning map or by contacting the Planning Department."
        },
        {
          question: 'How can I learn more about the UDO?',
          answer: 'Use Charlotte Explorer to learn more about your zoning and more.'
        },
        {
          question: 'How are text amendments processed?',
          answer: 'Text amendments follow a public process including staff review, public hearing, Planning Commission recommendation, and City Council approval. Check our Text Amendments page for current proposals.'
        }
      ]
    };

    // Update the homepage
    const result = await directus.request(updateItem('home_page', 1, updatedData));
    
    console.log('✅ Homepage updated successfully!');
    console.log('Updated data:', JSON.stringify(result, null, 2));

  } catch (error) {
    console.error('❌ Error updating homepage:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

updateHomepage();
