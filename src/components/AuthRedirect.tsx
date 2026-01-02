'use client';

import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function AuthRedirect() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && user) {
      const role = localStorage.getItem('userRole');
      if (role === 'player') {
        router.push('/player');
      } else if (role === 'coach') {
        router.push('/coach');
      }
      // Clear the role after redirecting
      localStorage.removeItem('userRole');
    }
  }, [user, isUserLoading, router]);

  return null;
}
