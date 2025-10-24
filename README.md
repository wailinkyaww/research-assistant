### Personal Research Assistant

The product is a personalized AI research assistant that helps users collect, organize and summarize information from the web.

It solves the problem of inefficient online research, where people often browse through dozens of tabs and struggle to extract and organize insights.

The product will allow the users to submit a query, which will trigger an automated pipeline that scrapes data from online sources, filters and analyzes it, and returns the structured summaries.

Targeted at students, researchers, and knowledge workers, the tool uses large language models to generate concise, and context-aware answers. Unlike traditional search engines, it provides unified, high-quality insights instead of scattered results.

----

#### Initial Architecture 

Here is the diagram of the architecture that I initially thought of:
![Architecture Diagram](./assets/whiteboard-architecture.png)

#### Final Architecture

The actual implementation differs from the initial design:

**Simplified Services:**
- **Next.js Edge Runtime**: Hosts both the AI agent and backend API. Handles web search directly using Google Custom Search API, eliminating the need for a separate Data Collector service for search operations.
- **Next.js Frontend**: Web interface for user interactions (unchanged from initial design).
- **Web Scraper Service**: A standalone TypeScript/Node.js service that combines the functionality of the original Data Analyzer and Data Collector. It handles:
  - Web scraping (fetching HTML from URLs)
  - Content cleaning and pre-processing
  - HTML-to-Markdown conversion for LLM consumption

**Technology Stack:**
- **LLM**: OpenAI GPT-4o for natural language understanding and response generation
- **Search**: Google Custom Search API integrated directly into the Edge Runtime
- **Message Queue**: RabbitMQ (via CloudAMQP free cloud instance) for asynchronous communication between the Edge Runtime and Web Scraper service

**Key Architectural Decisions:**
1. Web search was moved to Edge Runtime because Google Custom Search API is lightweight and doesn't require heavy processing infrastructure
2. Data Analyzer and Data Collector were merged into a single Web Scraper service, as both deal with web content processing
3. RabbitMQ provides reliable async communication, allowing the web scraper to handle time-intensive operations without blocking the main API
