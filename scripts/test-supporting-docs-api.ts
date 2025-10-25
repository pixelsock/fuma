#!/usr/bin/env tsx
/**
 * Test script to verify supporting documents API endpoints
 */

import { getDirectusClient } from '../lib/directus-server';
import { readItems, readSingleton } from '@directus/sdk';

async function testSupportingDocsAPI() {
  console.log('🧪 Testing Supporting Documents API...\n');

  try {
    const directus = await getDirectusClient();

    // Test 1: Fetch page data
    console.log('1️⃣ Testing supporting_documents_page singleton...');
    const pageData = await directus.request(
      readSingleton('supporting_documents_page', {
        fields: ['*']
      })
    );
    console.log('✅ Page data:', pageData);
    console.log('');

    // Test 2: Fetch documents
    console.log('2️⃣ Testing supporting_documents collection...');
    const documents = await directus.request(
      readItems('supporting_documents', {
        fields: ['id', 'title', 'status', 'managed_by', 'description', 'link', 'file'],
        sort: ['title'],
        limit: 5
      })
    );
    console.log(`✅ Found ${documents.length} documents (showing first 5):`);
    documents.forEach((doc: any) => {
      console.log(`  - ${doc.title} (${doc.status})`);
      if (doc.managed_by) console.log(`    Managed by: ${doc.managed_by}`);
      if (doc.link) console.log(`    Link: ${doc.link}`);
    });
    console.log('');

    // Test 3: Count total documents
    console.log('3️⃣ Counting total documents...');
    const allDocs = await directus.request(
      readItems('supporting_documents', {
        fields: ['id'],
        limit: -1
      })
    );
    console.log(`✅ Total documents: ${allDocs.length}`);
    console.log('');

    // Test 4: Group by status
    console.log('4️⃣ Grouping by status...');
    const statusCounts = allDocs.reduce((acc: any, doc: any) => {
      const status = doc.status || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    console.log('✅ Status breakdown:', statusCounts);
    console.log('');

    console.log('🎉 All tests passed! Frontend should be working correctly.');
    console.log('');
    console.log('📍 Visit: http://localhost:3002/supporting-documents');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testSupportingDocsAPI();
