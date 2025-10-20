'use client'

import { useEffect, useState } from 'react'
import { isVisualEditingMode } from '@/lib/visual-editing-helpers'
import { EditableText } from '@/components/editable-text'

export default function VisualEditingTestPage() {
  const [isEnabled, setIsEnabled] = useState(false)
  const [url, setUrl] = useState('')
  const [queryParams, setQueryParams] = useState('')

  useEffect(() => {
    setIsEnabled(isVisualEditingMode())
    setUrl(window.location.href)
    setQueryParams(window.location.search)
  }, [])

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Visual Editing Test Page</h1>
      
      {/* Status Display */}
      <div className={`p-6 rounded-lg mb-6 ${isEnabled ? 'bg-green-100 border-2 border-green-500' : 'bg-red-100 border-2 border-red-500'}`}>
        <h2 className="text-xl font-bold mb-2">
          {isEnabled ? '✅ Visual Editing ENABLED' : '❌ Visual Editing DISABLED'}
        </h2>
        <div className="space-y-2 text-sm">
          <p><strong>Current URL:</strong> {url}</p>
          <p><strong>Query Params:</strong> {queryParams || '(none)'}</p>
          <p><strong>Expected:</strong> ?visual-editing=true</p>
        </div>
      </div>

      {/* Instructions */}
      {!isEnabled && (
        <div className="bg-yellow-50 border-2 border-yellow-400 p-4 rounded-lg mb-6">
          <h3 className="font-bold mb-2">⚠️ To enable visual editing:</h3>
          <p className="mb-2">Add <code className="bg-yellow-200 px-2 py-1 rounded">?visual-editing=true</code> to the URL</p>
          <a 
            href="/visual-editing-test?visual-editing=true"
            className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Click here to enable
          </a>
        </div>
      )}

      {/* Test Editable Component */}
      <div className="border-2 border-gray-300 p-6 rounded-lg mb-6">
        <h3 className="text-lg font-semibold mb-4">Test Editable Text:</h3>
        <EditableText
          collection="home_page"
          itemId={1}
          field="header_text"
          mode="popover"
          as="p"
          className="text-xl p-4 bg-blue-50 rounded"
        >
          This text should be editable when visual editing is enabled
        </EditableText>
        <p className="text-sm text-gray-600 mt-2">
          {isEnabled 
            ? 'Inspect this element - it should have a data-directus attribute'
            : 'Enable visual editing to see the data-directus attribute'}
        </p>
      </div>

      {/* Console Check */}
      <div className="bg-gray-100 p-4 rounded-lg">
        <h3 className="font-bold mb-2">Console Output Check:</h3>
        <p className="text-sm mb-2">Open your browser console and look for:</p>
        <ul className="list-disc list-inside text-sm space-y-1">
          <li><code>[isVisualEditingMode]</code> - Debug logs</li>
          <li><code>[VisualEditingProvider]</code> - Initialization status</li>
          <li><code>[Visual Editing]</code> - Connection status</li>
        </ul>
      </div>
    </div>
  )
}
