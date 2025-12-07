
import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
import path from 'path';

// Load env from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: '2024-01-01',
    useCdn: false,
});

async function checkSlugs() {
    try {
        // Search for title with "소액으로"
        const posts = await client.fetch(`*[_type == "post" && title match "소액으로*"] {
      title,
      "slug": slug.current
    }`);

        console.log('--- SLUG REPORT (Targeted) ---');
        if (posts.length === 0) {
            console.log('No posts found matching "소액으로"');
        }
        posts.forEach((p: any) => {
            console.log(`Title: ${p.title}`);
            console.log(`Slug : ${p.slug}`);
            if (p.slug) {
                console.log(`Encoded: ${encodeURIComponent(p.slug)}`);
            } else {
                console.log('Slug is NULL/UNDEFINED');
            }
            console.log('---');
        });
    } catch (error) {
        console.error('Error fetching slugs:', error);
    }
}

checkSlugs();
