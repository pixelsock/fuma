import { EditableText } from '@/components/editable-text'

export default function TestVisualEditingPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">Visual Editing Test Page</h1>
      
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Open this page with <code className="bg-muted px-2 py-1 rounded">?visual-editing=true</code> to test visual editing.
        </p>
        
        <div className="border p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Test Editable Text</h2>
          <EditableText
            collection="home_page"
            itemId={1}
            field="header_text"
            mode="popover"
            as="p"
            className="text-lg"
          >
            This text should be editable when visual-editing=true is in the URL
          </EditableText>
        </div>
        
        <div className="bg-muted p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Instructions:</h3>
          <ol className="list-decimal list-inside space-y-1">
            <li>Add <code>?visual-editing=true</code> to the URL</li>
            <li>Open browser console to see initialization logs</li>
            <li>Inspect the paragraph above - it should have a <code>data-directus</code> attribute</li>
            <li>The text should be clickable/editable if Directus connection is working</li>
          </ol>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Expected Console Output:</h3>
          <pre className="text-sm bg-white p-2 rounded overflow-x-auto">
{`[VisualEditingProvider] Initializing visual editing...
[Visual Editing] Initializing with URL: http://localhost:8056
[Visual Editing] Successfully initialized`}
          </pre>
        </div>
      </div>
    </div>
  )
}
