"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useCases } from '@/context/CasesContext';
import Dashboards from '@/components/ot/Dashboards';

export default function OTPageClient() {
  const router = useRouter();
  const { cases } = useCases();

  return (
    <Dashboards
      cases={cases}
      activeDashboard="ot"
      onSelectCase={(caseId) => router.push(`/ot/cases/${caseId}`)}
    />
  );
}
