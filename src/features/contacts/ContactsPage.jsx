import React from 'react';
import { EmptyState } from '@/components/ui/EmptyState';
import { Users } from 'lucide-react';

export function ContactsPage() {
  return (
    <div className="h-full bg-white rounded-xl border border-gray-200">
      <EmptyState title="Leads & Contatos" description="A tabela de contatos será implementada na Fase 5." icon={Users} />
    </div>
  );
}