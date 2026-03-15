import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

export const sanityClient = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
  dataset: import.meta.env.VITE_SANITY_DATASET || 'production',
  apiVersion: '2024-03-01',
  useCdn: true, // CDN for reads
});

const builder = imageUrlBuilder(sanityClient);

/**
 * Build a URL for a Sanity image asset.
 * @param {object} source - Sanity image asset reference
 * @returns {import('@sanity/image-url/lib/types/builder').ImageUrlBuilder}
 */
export function urlFor(source) {
  return builder.image(source);
}
