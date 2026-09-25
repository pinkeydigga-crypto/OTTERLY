// lib/image.ts

/**
 * Supabase Storage URL ko clean rakhta hai taaki 400 Bad Request error na aaye.
 * Next.js ka <Image /> tag automatically isko compress aur cache kar lega.
 */
export function getOptimizedImageUrl(url: string): string {
  if (!url) return "";
  return url;
}