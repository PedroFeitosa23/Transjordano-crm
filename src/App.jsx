import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { PipelinePage } from '@/features/pipeline/PipelinePage';
import { ContactsPage } from '@/features/contacts/ContactsPage';
import { LoginPage } from '@/features/auth/LoginPage';
import { AuthProvider } from '@/features/auth/AuthContext';
import { CopilotPage } from '@/features/ai/CopilotPage';
import { ForecastPage } from '@/features/ai/ForecastPage';
import { GeneratorPage } from '@/features/ai/GeneratorPage';
import { Toaster } from 'sonner';

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/', element: <AppLayout />, children: [
      { index: true, element: <DashboardPage /> },
      { path: 'funil', element: <PipelinePage /> },
      { path: 'leads', element: <ContactsPage /> },
      { path: 'ia/copiloto', element: <CopilotPage /> },
      { path: 'ia/previsoes', element: <ForecastPage /> },
      { path: 'ia/propostas', element: <GeneratorPage /> }
    ]
  }
]);

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" richColors />
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
