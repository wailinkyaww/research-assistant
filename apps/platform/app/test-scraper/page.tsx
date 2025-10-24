'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function TestScraperPage() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    url?: string
    markdown?: string
    html?: string
    error?: string
    timestamp?: string
  } | null>(null)

  const handleScrape = async () => {
    if (!url.trim()) {
      alert('Please enter a URL')
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/test-scraper', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url })
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to scrape'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen bg-zinc-900 p-8'>
      <div className='mx-auto max-w-4xl'>
        <h1 className='mb-8 text-3xl font-bold text-white'>RabbitMQ Web Scraper Test</h1>

        {/* Input Section */}
        <div className='mb-8 rounded-lg border border-zinc-700 bg-zinc-800 p-6'>
          <label className='mb-2 block text-sm font-medium text-zinc-300'>URL to Scrape</label>
          <div className='flex gap-4'>
            <input
              type='url'
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder='https://example.com'
              className='flex-1 rounded-md border border-zinc-600 bg-zinc-700 px-4 py-2 text-white placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
              disabled={loading}
            />
            <button
              onClick={handleScrape}
              disabled={loading}
              className='rounded-md bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50'>
              {loading ? 'Scraping...' : 'Scrape'}
            </button>
          </div>
        </div>

        {/* Results Section */}
        {loading && (
          <div className='rounded-lg border border-zinc-700 bg-zinc-800 p-6'>
            <div className='flex items-center justify-center'>
              <div className='h-8 w-8 animate-spin rounded-full border-4 border-zinc-600 border-t-blue-500'></div>
              <span className='ml-3 text-zinc-300'>Scraping webpage...</span>
            </div>
          </div>
        )}

        {result && !loading && (
          <div className='space-y-6'>
            {/* Status */}
            <div
              className={`rounded-lg border p-4 ${
                result.success
                  ? 'border-green-700 bg-green-900/20'
                  : 'border-red-700 bg-red-900/20'
              }`}>
              <div className='flex items-center gap-2'>
                <span
                  className={`text-lg font-semibold ${result.success ? 'text-green-400' : 'text-red-400'}`}>
                  {result.success ? '✓ Success' : '✗ Error'}
                </span>
                {result.url && <span className='text-zinc-400'>• {result.url}</span>}
              </div>
              {result.error && <p className='mt-2 text-red-300'>{result.error}</p>}
              {result.timestamp && (
                <p className='mt-1 text-xs text-zinc-500'>
                  Scraped at: {new Date(result.timestamp).toLocaleString()}
                </p>
              )}
            </div>

            {/* Markdown Preview */}
            {result.success && result.markdown && (
              <div className='rounded-lg border border-zinc-700 bg-zinc-800 p-6'>
                <h2 className='mb-4 text-xl font-semibold text-white'>Markdown Preview</h2>
                <div className='prose prose-invert max-w-none'>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{result.markdown}</ReactMarkdown>
                </div>
              </div>
            )}

            {/* Raw Markdown */}
            {result.success && result.markdown && (
              <div className='rounded-lg border border-zinc-700 bg-zinc-800 p-6'>
                <h2 className='mb-4 text-xl font-semibold text-white'>Raw Markdown</h2>
                <pre className='max-h-96 overflow-auto rounded bg-zinc-900 p-4 text-xs text-zinc-300'>
                  {result.markdown}
                </pre>
              </div>
            )}

            {/* Cleaned HTML */}
            {result.success && result.html && (
              <div className='rounded-lg border border-zinc-700 bg-zinc-800 p-6'>
                <h2 className='mb-4 text-xl font-semibold text-white'>Cleaned HTML</h2>
                <pre className='max-h-96 overflow-auto rounded bg-zinc-900 p-4 text-xs text-zinc-300'>
                  {result.html}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
