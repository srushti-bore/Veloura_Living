import React from 'react';
import { RoomDetailPage } from '@/components/views/rooms/RoomDetailPage';

export const metadata = {
  title: 'Room Scene Details | Veloura Living',
  description: 'Interactive room scene with clickable piece hotspots and complete room bundle ordering.'
};

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <RoomDetailPage roomSlug={slug} />;
}
