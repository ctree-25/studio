'use client';

import { ArrowRight, User, Shield } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { AuthRedirect } from '@/components/AuthRedirect';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const auth = useAuth();
  const { toast } = useToast();

  const handleSignIn = async (provider: 'player' | 'coach') => {
    if (!auth) return;
    const googleProvider = new GoogleAuthProvider();
    try {
      // Store the intended role before initiating sign-in
      localStorage.setItem('userRole', provider);
      await signInWithPopup(auth, googleProvider);
      // The AuthRedirect component will handle redirection on successful login.
    } catch (error: any) {
      // Don't show an error if the user closes the popup
      if (error.code === 'auth/popup-closed-by-user') {
        localStorage.removeItem('userRole');
        return;
      }
      
      console.error("Google Sign-In Error:", error);
      toast({
        variant: "destructive",
        title: "Sign-In Failed",
        description: "Could not sign in with Google. Please try again.",
      });
      // Clear the role if sign-in fails
      localStorage.removeItem('userRole');
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <AuthRedirect />
      <AppHeader />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline">
                    Elevate Your Game with Expert Feedback
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    CourtConnect is the ultimate platform for high school volleyball players to get feedback on their skills from experienced coaches.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-4 min-h-[300px] justify-center">
                 <Card>
                    <CardHeader className="flex flex-row items-center gap-4">
                       <User className="w-8 h-8 text-primary" />
                       <CardTitle>Player Portal</CardTitle>
                    </CardHeader>
                    <CardContent>
                       <p className="text-muted-foreground mb-4">Create your profile, share your highlights, and receive expert feedback to elevate your game.</p>
                       <div className="flex gap-4">
                        <Link href="/player/demo" className="flex-1">
                          <Button variant="secondary" className="w-full">Demo</Button>
                        </Link>
                        <Button onClick={() => handleSignIn('player')} className='flex-1'>
                            Dive In
                        </Button>
                       </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center gap-4">
                       <Shield className="w-8 h-8 text-primary" />
                       <CardTitle>Coach Portal</CardTitle>
                    </CardHeader>
                    <CardContent>
                       <p className="text-muted-foreground mb-4">Use your expertise to unlock a player's full potential. Guide the next generation of talent.</p>
                       <div className="flex gap-4">
                          <Link href="/coach/demo" className='flex-1'>
                            <Button variant="secondary" className="w-full">Demo</Button>
                          </Link>
                          <Button onClick={() => handleSignIn('coach')} className="flex-1">
                            Dive In
                          </Button>
                       </div>
                    </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
