import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://www.otterleo.in';

  return {
    rules: [
      {
        // Search Engine Crawlers (Google, Bing, DuckDuckGo)
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/settings/',
          '/api/',
          '/_next/data/', // Only block raw data, allow static assets
        ],
      },
      {
        // AI Crawlers & LLM Engines (Perplexity, ChatGPT, Claude, Apple, Google Gemini/Extended)
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'OAI-SearchBot',
          'PerplexityBot',
          'ClaudeBot',
          'AnthropicAI',
          'Google-Extended',
          'Applebot-Extended',
          'CCBot',
          'cohere-ai',
        ],
        allow: [
          '/',
          '/about',
          '/blog',
          '/terms',
          '/achievements',
        ],
        disallow: [
          '/dashboard/',
          '/settings/',
          '/api/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}