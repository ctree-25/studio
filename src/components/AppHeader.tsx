import { Volleyball } from 'lucide-react';
import Link from 'next/link';

export function AppHeader() {
  return (
    <header className="px-4 lg:px-6 h-14 flex items-center bg-background/80 backdrop-blur-sm sticky top-0 z-50 border-b">
      <Link href="/" className="flex items-center justify-center">
        <Volleyball className="h-6 w-6 text-primary" />
        <span className="ml-2 text-lg font-semibold font-headline">CourtConnect</span>
      </Link>
    </header>
  );
}
