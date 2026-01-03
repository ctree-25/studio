'use client';

import { useUser, useFirestore, setDocumentNonBlocking } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { doc } from 'firebase/firestore';

export function AuthRedirect() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();

  useEffect(() => {
    if (!isUserLoading && user) {
      const role = localStorage.getItem('userRole');
      
      if (role && firestore) {
        const userRef = doc(firestore, 'users', user.uid);
        // Using set with merge to create or update the user document with their role.
        // This is crucial for our security rules.
        setDocumentNonBlocking(userRef, { 
          uid: user.uid,
          email: user.email,
          role: role,
        }, { merge: true });
      }

      if (role === 'player') {
        router.push('/player');
      } else if (role === 'coach') {
        router.push('/coach');
      }
      // Clear the role from localStorage after using it.
      localStorage.removeItem('userRole');
    }
  }, [user, isUserLoading, router, firestore]);

  return null;
}
