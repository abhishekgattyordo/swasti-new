export const dynamic = 'force-dynamic';

import React from 'react';
import CaseWorkflowPageClient from './CaseWorkflowPageClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params;
  return <CaseWorkflowPageClient id={resolvedParams.id} />;
}
