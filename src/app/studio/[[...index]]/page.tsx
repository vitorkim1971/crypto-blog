'use client';

import dynamic from 'next/dynamic';

const NextStudio = dynamic(() => import('next-sanity/studio').then((mod) => mod.NextStudio), {
  ssr: false,
});

const config = require('../../../../sanity.config').default;

export default function StudioPage() {
  return <NextStudio config={config} />;
}
