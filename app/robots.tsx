import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://www.otterleo.in';

  return {
    rules: [
      {
        // General Search Engine Bots (Google, Bing, etc.)
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/api/',
          '/_next/',
          '/static/',
        ],
      },
      {
        // AI Search Engine Bots (OpenAI, Perplexity, Claude, Apple, Google AI)
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'PerplexityBot',
          'ClaudeBot',
          'AnthropicAI',
          'Google-Extended',
          'Applebot-Extended',
        ],
        allow: [
          '/',
          '/about',
        ],
        disallow: [
          '/dashboard/',
          '/api/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}