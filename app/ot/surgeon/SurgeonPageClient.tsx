"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useCases } from '@/context/CasesContext';
import Dashboards from '@/components/ot/Dashboards';

export default function SurgeonPageClient() {
  const router = useRouter();
  const { cases } = useCases();

  return (
    <Dashboards
      cases={cases}
      activeDashboard="surgeon"
      onSelectCase={(caseId) => router.push(`/ot/cases/${caseId}`)}
    />
  );
}
