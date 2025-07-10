// Simple test script to verify ProseMirror to Markdown conversion
const { proseMirrorToMarkdown } = require('./utils/prosemirror.ts');

// Sample ProseMirror content
const sampleContent = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 1 },
      content: [{ type: 'text', text: 'Hello World' }]
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'This is a ' },
        { type: 'text', text: 'bold', marks: [{ type: 'strong' }] },
        { type: 'text', text: ' text example.' }
      ]
    },
    {
      type: 'bullet_list',
      content: [
        {
          type: 'list_item',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'First item' }]
            }
          ]
        },
        {
          type: 'list_item',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Second item' }]
            }
          ]
        }
      ]
    }
  ]
};

try {
  const markdown = proseMirrorToMarkdown(sampleContent);
  console.log('✅ ProseMirror to Markdown conversion successful!');
  console.log('Generated Markdown:');
  console.log('---');
  console.log(markdown);
  console.log('---');
} catch (error) {
  console.error('❌ Conversion failed:', error);
}
