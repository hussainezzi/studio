'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from 'lucide-react';
import Link from 'next/link';

const signInSchema = z.object({
  username: z.string().min(3, { message: "اسم المستخدم يجب أن يكون 3 أحرف على الأقل" }),
  password: z.string().min(6, { message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" }),
});

type SignInFormValues = z.infer<typeof signInSchema>;

export default function SignInPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = async (data: SignInFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await signIn('credentials', {
        redirect: false, // Don't redirect automatically, handle it manually
        username: data.username,
        password: data.password,
      });

      if (result?.error) {
         // Handle specific errors if possible, otherwise show generic message
         if (result.error === "CredentialsSignin") {
             setError("اسم المستخدم أو كلمة المرور غير صحيحة.");
         } else {
             setError('حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.');
         }
        console.error('Sign-in error:', result.error);
      } else if (result?.ok) {
        router.push('/'); // Redirect to home page on successful login
        router.refresh(); // Refresh server components
      } else {
         setError('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.');
      }
    } catch (err) {
      console.error('Sign-in exception:', err);
      setError('حدث خطأ في الشبكة أو الخادم.');
    } finally {
       setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center">تسجيل الدخول</CardTitle>
          <CardDescription className="text-center">
            أدخل اسم المستخدم وكلمة المرور للوصول إلى حسابك.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <Terminal className="h-4 w-4" />
              <AlertTitle>خطأ في تسجيل الدخول</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="username">اسم المستخدم</FormLabel>
                    <FormControl>
                      <Input id="username" placeholder="اسم المستخدم الخاص بك" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="password">كلمة المرور</FormLabel>
                    <FormControl>
                      <Input id="password" type="password" placeholder="********" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
              </Button>
            </form>
          </Form>
           <div className="mt-4 text-center text-sm">
             ليس لديك حساب؟{' '}
             <Link href="/auth/signup" className="underline text-primary hover:text-primary/80">
               أنشئ حساباً جديداً
             </Link>
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
