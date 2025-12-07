import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Victor's Alpha Studio",
  description: "Content management for Victor's Alpha blog",
};

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
