'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogIn, LogOut, PlusCircle, User } from 'lucide-react';

export default function AppHeader() {
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';

  const getInitials = (name?: string | null) => {
    if (!name) return '؟'; // Question mark if no name
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <header className="bg-primary text-primary-foreground shadow-md sticky top-0 z-50">
      <nav className="container mx-auto flex items-center justify-between px-4 py-3">
        <Link href="/" className="text-2xl font-bold font-serif">
          ديوان العرب
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/poems">
            <Button variant="ghost" className="text-primary-foreground hover:bg-primary/80">القصائد</Button>
          </Link>
          {isLoading ? (
            <div className="h-8 w-20 animate-pulse rounded-md bg-primary/50"></div>
          ) : session?.user ? (
            <>
              <Link href="/poems/create">
                <Button variant="ghost" className="text-primary-foreground hover:bg-primary/80">
                  <PlusCircle className="ml-2 h-4 w-4" />
                  إضافة قصيدة
                </Button>
              </Link>
              {/* Add Profile Link if implemented */}
              {/* <Link href={`/profile/${session.user.username}`}>
                <Button variant="ghost" className="text-primary-foreground hover:bg-primary/80">
                   <User className="ml-2 h-4 w-4" />
                  ملفي الشخصي
                </Button>
              </Link> */}
              <Button
                variant="ghost"
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-primary-foreground hover:bg-destructive/80 hover:text-destructive-foreground"
              >
                <LogOut className="ml-2 h-4 w-4" />
                تسجيل الخروج
              </Button>
              <Avatar className="h-8 w-8">
                {/* Placeholder for user image if available */}
                {/* <AvatarImage src={session.user.image} alt={session.user.name ?? 'User'} /> */}
                <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                  {getInitials(session.user.name ?? session.user.username)}
                </AvatarFallback>
              </Avatar>
            </>
          ) : (
            <>
              <Link href="/auth/signin">
                <Button variant="ghost" className="text-primary-foreground hover:bg-primary/80">
                  <LogIn className="ml-2 h-4 w-4" />
                  تسجيل الدخول
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button variant="secondary" className="bg-accent text-accent-foreground hover:bg-accent/90">
                  إنشاء حساب
                </Button>
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
