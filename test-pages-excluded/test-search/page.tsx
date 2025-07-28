'use client';

import { useState } from 'react';

export default function TestSearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const endpoint = process.env.NEXT_PUBLIC_ORAMA_ENDPOINT;
      const apiKey = process.env.NEXT_PUBLIC_ORAMA_API_KEY;
      
      if (!endpoint || !apiKey) {
        throw new Error('Orama configuration missing');
      }

      const searchParams = {
        term: query
      };
      
      const url = `${endpoint}/search?api-key=${apiKey}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `q=${encodeURIComponent(JSON.stringify(searchParams))}`,
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('Orama search error:', response.status, text);
        throw new Error(`Search failed: ${response.status}`);
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Orama Search Test</h1>
      
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search for something..."
          className="flex-1 px-3 py-2 border rounded"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded mb-4">
          Error: {error}
        </div>
      )}

      {results && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Results:</h2>
          <pre className="p-4 bg-gray-100 rounded overflow-auto">
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}