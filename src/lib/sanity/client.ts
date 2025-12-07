import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';
import { SanityImageSource } from '@sanity/image-url/lib/types/types';

// Check if Sanity is configured with valid values
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;

export const isSanityConfigured =
  !!projectId && projectId.length > 0 && projectId !== 'your_sanity_project_id' &&
  !!dataset && dataset.length > 0;

export const client = createClient({
  projectId: isSanityConfigured ? projectId! : 'dummy-project-id',
  dataset: isSanityConfigured ? dataset! : 'production',
  apiVersion: '2024-01-01',
  useCdn: process.env.NODE_ENV === 'production',
  token: process.env.SANITY_API_TOKEN,
});

const builder = imageUrlBuilder(client);

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}
