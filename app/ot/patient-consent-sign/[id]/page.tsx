import React from 'react';
import PatientConsentSignClient from './PatientConsentSignClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params;
  return <PatientConsentSignClient caseId={resolvedParams.id} />;
}
