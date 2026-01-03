'use client';

import { useUser, useFirestore } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export function AuthRedirect() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();

  useEffect(() => {
    if (isUserLoading || !user || !firestore) {
      return;
    }

    const role = localStorage.getItem('userRole');
    if (!role) {
      // If a role is not in localStorage but user is logged in,
      // we can try to read their role from Firestore or redirect to a default page.
      // For now, we assume if they are logged in and have no role, they've been here before.
      return;
    }
    
    const userRef = doc(firestore, 'users', user.uid);

    // Check if the user document already exists
    getDoc(userRef).then(docSnap => {
      if (!docSnap.exists()) {
        // Document doesn't exist, so create it.
        // This is crucial for security rules that depend on the user's role.
        setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          role: role,
        }, { merge: true }).then(() => {
            // After creating the doc, redirect
            redirectUser(role);
        });
      } else {
         // User doc exists, just redirect
         redirectUser(role);
      }
    });

    const redirectUser = (userRole: string) => {
        if (userRole === 'player') {
            router.push('/player');
        } else if (userRole === 'coach') {
            router.push('/coach');
        }
        // Clear the role from localStorage after using it to prevent re-triggers.
        localStorage.removeItem('userRole');
    }

  }, [user, isUserLoading, router, firestore]);

  return null;
}
