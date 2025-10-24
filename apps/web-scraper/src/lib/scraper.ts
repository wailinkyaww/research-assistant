import axios from 'axios'
import {parseWebPageToMarkdown} from './markdown'

export interface ScrapeResult {
  url: string
  success: boolean
  markdown?: string
  html?: string
  error?: string
}

/**
 * Scrapes a website and converts it to clean markdown
 * @param url - The URL of the website to scrape
 * @returns ScrapeResult containing markdown and html, or error if failed
 */
export async function scrapeWebsite(url: string): Promise<ScrapeResult> {
  try {
    // Validate URL
    new URL(url)

    // Fetch the HTML content
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ResearchAssistant/1.0; +http://example.com/bot)'
      },
      timeout: 30000, // 30 seconds timeout
      maxContentLength: 10 * 1024 * 1024 // 10MB max
    })

    if (response.status !== 200) {
      return {
        url,
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`
      }
    }

    const html = response.data

    // Parse and clean the HTML to markdown
    const {html: cleanedHtml, markdown} = parseWebPageToMarkdown(html)

    return {
      url,
      success: true,
      markdown,
      html: cleanedHtml
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        url,
        success: false,
        error: error.message
      }
    }

    if (error instanceof Error) {
      return {
        url,
        success: false,
        error: error.message
      }
    }

    return {
      url,
      success: false,
      error: 'Unknown error occurred'
    }
  }
}