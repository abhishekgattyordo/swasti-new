"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useCases } from '@/context/CasesContext';
import CaseWorkflowManager from '@/components/ot/CaseWorkflowManager';
import { AlertCircle, ArrowLeft } from 'lucide-react';

interface CaseWorkflowPageClientProps {
  id: string;
}

export default function CaseWorkflowPageClient({ id }: CaseWorkflowPageClientProps) {
  const router = useRouter();
  const { getCaseById, updateCase } = useCases();

  const selectedCase = getCaseById(id);

  if (!selectedCase) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600">
          <AlertCircle className="w-12 h-12" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Surgical Case Not Found</h2>
          <p className="text-sm text-slate-500 mt-1">The requested patient case code ({id}) could not be located in SWASTI database.</p>
        </div>
        <button
          onClick={() => router.push('/cases')}
          className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Cases Directory
        </button>
      </div>
    );
  }

  return (
    <CaseWorkflowManager
      selectedCase={selectedCase}
      onBack={() => router.push('/cases')}
      onUpdateCase={updateCase}
    />
  );
}
