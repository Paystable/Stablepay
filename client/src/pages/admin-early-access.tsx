import React from 'react';
import { AdminEarlyAccessPanel } from '../components/admin-early-access-panel';

export default function AdminEarlyAccessPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <AdminEarlyAccessPanel />
      </div>
    </div>
  );
}