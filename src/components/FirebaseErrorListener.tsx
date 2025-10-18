
'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';

// This component is responsible for listening to Firestore permission errors
// and throwing them in a way that the Next.js development overlay can catch
// and display them. This is for development-time debugging only.

export function FirebaseErrorListener() {
  useEffect(() => {
    const handleError = (error: Error) => {
      // Throwing the error here will cause it to be displayed in the Next.js
      // development overlay, which is exactly what we want for debugging.
      throw error;
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, []);

  return null; // This component does not render anything.
}
