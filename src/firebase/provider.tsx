
'use client';

import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import React from 'react';

// This provider component is a simple wrapper that includes the
// FirebaseErrorListener. It should be used at the root of the
// application to ensure that the error listener is always active.
export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <FirebaseErrorListener />
      {children}
    </>
  );
}
