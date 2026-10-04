import React from 'react';
import { AccountPage } from '@/components/views/account/AccountPage';

export const metadata = {
  title: 'Your Orders & Invoices | Veloura Living',
  description: 'Track white-glove delivery, download official GST tax invoices, and manage post-purchase returns.'
};

export default function Page() {
  return <AccountPage />;
}
