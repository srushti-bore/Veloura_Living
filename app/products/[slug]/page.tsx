import React from 'react';
import { ProductDetailPage } from '@/components/views/product/ProductDetailPage';

export const metadata = {
  title: 'Handcrafted Piece Details | Veloura Living',
  description: 'Detailed specifications, tactile swatch selector, dimensions, and in-home white glove delivery.'
};

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ProductDetailPage slug={slug} />;
}
