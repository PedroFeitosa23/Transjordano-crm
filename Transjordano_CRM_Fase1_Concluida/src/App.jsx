import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { PipelinePage } from '@/features/pipeline/PipelinePage';
import { ContactsPage } from '@/features/contacts/ContactsPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'funil', element: <PipelinePage /> },
      { path: 'leads', element: <ContactsPage /> }
    ]
  }
]);

export default function App() {
  return <RouterProvider router={router} />;
}