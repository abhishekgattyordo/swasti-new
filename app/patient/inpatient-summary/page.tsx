
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import InPatientSummaryContent from './content';

export default function InPatientSummaryPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    }>
      <InPatientSummaryContent />
    </Suspense>
  );
}