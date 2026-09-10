// app/sitemap.ts
import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://otterly-prototype.vercel.app',
      lastModified: new Date(),
    },
    {
      url: 'https://otterly-prototype.vercel.app/about',
      lastModified: new Date(),
    },
    {
      url: 'https://otterly-prototype.vercel.app/blog/how-to-learn-drawing-with-ai',
      lastModified: new Date(),
    },
  ]
}