import React from 'react';
import type { Metadata } from 'next';
import { AdminDashboardPage } from '@/components/views/admin/AdminDashboardPage';

export const metadata: Metadata = {
  title: 'Operations & CMS Console | Veloura Living',
  description: 'Live catalog inventory, interactive room staging coordinates, and spatial AI analytics.'
};

export default function Page() {
  return <AdminDashboardPage />;
}
