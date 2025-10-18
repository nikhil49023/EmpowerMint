
'use client';

import { Suspense } from 'react';
import { redirect, useSearchParams } from 'next/navigation';

function PaperPlateManufacturingRedirect() {
  const searchParams = useSearchParams();
  const idea = searchParams.get('idea') || 'Paper Plate Manufacturing Business';

  redirect(`/investment-ideas/custom?idea=${encodeURIComponent(idea)}`);
  return null;
}

export default function InvestmentIdeaPage() {
  return (
    <Suspense fallback={<p>Loading analysis...</p>}>
      <PaperPlateManufacturingRedirect />
    </Suspense>
  );
}
