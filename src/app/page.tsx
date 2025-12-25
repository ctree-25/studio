import { ArrowRight, User, Shield } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AppHeader } from '@/components/AppHeader';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
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
                 <Link href="/player" className="group">
                    <Card className="hover:bg-card/80 transition-colors duration-300 transform hover:-translate-y-1 hover:shadow-2xl">
                        <CardHeader className="flex flex-row items-center gap-4">
                           <User className="w-8 h-8 text-primary" />
                           <CardTitle>Player Portal</CardTitle>
                           <ArrowRight className="w-5 h-5 ml-auto text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-transform"/>
                        </CardHeader>
                        <CardContent>
                           <p className="text-muted-foreground">Create your profile, share your highlight link, and receive expert feedback to elevate your game.</p>
                        </CardContent>
                    </Card>
                 </Link>
                 <Link href="/coach" className="group">
                    <Card className="hover:bg-card/80 transition-colors duration-300 transform hover:-translate-y-1 hover:shadow-2xl">
                        <CardHeader className="flex flex-row items-center gap-4">
                           <Shield className="w-8 h-8 text-primary" />
                           <CardTitle>Coach Portal</CardTitle>
                           <ArrowRight className="w-5 h-5 ml-auto text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-transform"/>
                        </CardHeader>
                        <CardContent>
                           <p className="text-muted-foreground">Review player footage and provide evaluations to help players improve.</p>
                        </CardContent>
                    </Card>
                 </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
