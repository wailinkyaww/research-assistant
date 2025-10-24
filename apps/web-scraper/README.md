# Web Scraper Service

A RabbitMQ-based web scraper service that converts HTML pages to clean, LLM-friendly Markdown.

## Features

- Consumes URLs from a RabbitMQ queue
- Scrapes web pages and cleans HTML content
- Converts HTML to clean Markdown format
- Removes scripts, styles, comments, and unnecessary attributes
- Supports both direct queue responses and RPC pattern (replyTo/correlationId)
- Sends results back to the caller

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Edit the `.env` file with your RabbitMQ configuration:

```env
RABBITMQ_URL=amqp://localhost:5672
RABBITMQ_QUEUE_INPUT=scraper-requests
RABBITMQ_QUEUE_OUTPUT=scraper-results
```

## Usage

### Development Mode

```bash
npm run dev
```

### Production Mode

Build and run:

```bash
npm run build
npm start
```

## Message Format

### Input Message (Request)

The service accepts messages in two formats:

1. Simple URL string:
```
https://example.com
```

2. JSON object:
```json
{
  "url": "https://example.com",
  "requestId": "optional-request-id"
}
```

### Output Message (Response)

The service sends back a JSON response:

```json
{
  "requestId": "optional-request-id",
  "url": "https://example.com",
  "success": true,
  "markdown": "# Page Title\n\nClean markdown content...",
  "html": "<html>Simplified HTML...</html>",
  "timestamp": "2024-10-24T12:00:00.000Z"
}
```

In case of errors:

```json
{
  "requestId": "optional-request-id",
  "url": "https://example.com",
  "success": false,
  "error": "Error message",
  "timestamp": "2024-10-24T12:00:00.000Z"
}
```

## RabbitMQ Patterns

### Direct Queue Pattern

Send messages to `scraper-requests` queue, receive results from `scraper-results` queue.

### RPC Pattern

Send messages with `replyTo` and `correlationId` properties set:

```javascript
channel.sendToQueue('scraper-requests', Buffer.from('https://example.com'), {
  replyTo: 'my-response-queue',
  correlationId: 'unique-correlation-id'
});
```

## Cleaning Logic

The service performs the following HTML cleaning operations:

1. Removes XML declarations and DOCTYPE
2. Removes scripts, styles, and comments
3. Removes all HTML attributes (except when configured otherwise)
4. Removes empty tags iteratively
5. Flattens redundant nested tags
6. Converts to Markdown using Turndown with:
   - ATX-style headings (# H1, ## H2, etc.)
   - GitHub Flavored Markdown (GFM) support
   - Tables, strikethrough, and task list items

## Architecture

```
src/
├── index.ts              # Main entry point
└── lib/
    ├── markdown.ts       # HTML to Markdown conversion
    ├── scraper.ts        # Web scraping logic
    └── rabbitmq.ts       # RabbitMQ consumer/producer
```

## Error Handling

- Network errors: Returns error response with message
- Invalid URLs: Returns error response
- Timeout: 30 seconds per request
- Max content size: 10MB
- Failed messages are not requeued to prevent infinite loops

## License

MIT