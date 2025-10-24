import * as cheerio from 'cheerio'
import TurndownService from 'turndown'

// @ts-ignore
import { gfm as gfmPlugin } from 'turndown-plugin-gfm'

/**
 Turndown is a service to turn html down to markdown.
 We want to modify a few formatting to better match with our use cases.

 Below are default formatting examples:
 Heading
 =========
 Sub Heading
 ---------

 We want to use atx syntax
 # H1
 ## H2

 Set heading style to `atx` in options.

 And we also use gfm plugin to improve common formatting fixes
 - tables
 - strikethrough
 - taskListItems

 We will have better formatting.
 */
const turndownService = new TurndownService({
  headingStyle: 'atx'
})
turndownService.use(gfmPlugin)

export function parseWebPageToMarkdown(html: string): { html: string; markdown: string } {
  const cleanedHTML = cleanXml(html)
  const simplifiedHTML = simplifyHtml(cleanedHTML)
  const markdown = turndownService.turndown(simplifiedHTML)

  return { html: simplifiedHTML, markdown }
}

function cleanXml(html: string): string {
  return html
    .replace(/<\?xml.*?\?>/gi, '')
    .replace(/<!DOCTYPE.*?>/gi, '')
    .replace(/<!doctype.*?>/gi, '')
}

// 1. retain only the useful tags for LLM ( remove script, styles )
// 2. remove all the attributes if necessary
// 3. remove empty tags ( tags with no inner text - we check this iteratively )
function simplifyHtml(html: string, keepAttr = false): string {
  const $ = cheerio.load(html)

  $('script, style').remove()

  $('*')
    .contents()
    .each((_, el) => {
      if (el.type === 'comment') {
        $(el).remove()
      }
    })

  // remove all attributes if keepAttr is false
  if (!keepAttr) {
    $('*').each((_, el) => {
      if ('attribs' in el && el.attribs) {
        for (const attr of Object.keys(el.attribs)) {
          $(el).removeAttr(attr)
        }
      }
    })
  }

  // remove href attributes from <a> tags
  $('a').removeAttr('href')

  // remove empty tags
  let removed = true
  while (removed) {
    removed = false
    $('*').each((_, el) => {
      if (!$(el).text().trim()) {
        $(el).remove()
        removed = true
      }
    })
  }

  // flatten redundant tags (if only one child and text is same)
  $('*').each((_, el) => {
    const $el = $(el)
    const children = $el.children()
    if (children.length === 1) {
      const text = $el.text().replace(/\s+/g, '')
      const childText = children.text().replace(/\s+/g, '')
      if (text === childText) {
        $el.replaceWith(children)
      }
    }
  })

  // remove empty lines
  return $.html()
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n')
}