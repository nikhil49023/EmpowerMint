
'use client';

import { Suspense } from 'react';
import { redirect } from 'next/navigation';

function PaperPlateManufacturingRedirect() {
  const idea = 'Paper Plate Manufacturing Business';

  // Redirect to the custom idea page with the idea as a query parameter
  redirect(`/investment-ideas/custom?idea=${encodeURIComponent(idea)}`);

  return null; // This component will not render anything
}

export default function InvestmentIdeaPage() {
  return (
    <Suspense fallback={<p>Loading analysis...</p>}>
      <PaperPlateManufacturingRedirect />
    </Suspense>
  );
}
