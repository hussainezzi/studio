'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, UserPlus } from 'lucide-react';
import { signUpAction } from '@/actions/authActions'; // Import server action
import Link from 'next/link';

const signUpSchema = z.object({
  username: z.string().min(3, { message: "اسم المستخدم يجب أن يكون 3 أحرف على الأقل" }).regex(/^[a-zA-Z0-9_]+$/, { message: "اسم المستخدم يمكن أن يحتوي فقط على حروف إنجليزية وأرقام وشرطة سفلية" }),
  password: z.string().min(6, { message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" }),
  confirmPassword: z.string(),
  email: z.string().email({ message: "البريد الإلكتروني غير صالح" }).optional().or(z.literal('')), // Optional email
  name: z.string().optional(), // Optional name
}).refine((data) => data.password === data.confirmPassword, {
  message: "كلمتا المرور غير متطابقتين",
  path: ["confirmPassword"], // Apply error to confirmPassword field
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

export default function SignUpPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: '',
      password: '',
      confirmPassword: '',
      email: '',
      name: '',
    },
  });

  const onSubmit = async (data: SignUpFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
       const result = await signUpAction({
           username: data.username,
           password: data.password,
           email: data.email || null, // Send null if empty
           name: data.name || null,   // Send null if empty
       });

      if (result.success) {
        // Optionally sign in the user automatically or redirect to sign-in
         // await signIn('credentials', { username: data.username, password: data.password });
         router.push('/auth/signin?signup=success'); // Redirect to sign-in with success message
         router.refresh();
      } else {
        setError(result.error || 'حدث خطأ غير متوقع أثناء إنشاء الحساب.');
      }
    } catch (err) {
      console.error('Sign-up exception:', err);
      setError('حدث خطأ في الشبكة أو الخادم.');
    } finally {
       setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center">إنشاء حساب جديد</CardTitle>
          <CardDescription className="text-center">
             املأ الحقول لإنشاء حسابك في ديوان العرب.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <Terminal className="h-4 w-4" />
              <AlertTitle>خطأ في إنشاء الحساب</AlertTitle>
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
                      <Input id="username" placeholder="اختر اسم مستخدم فريد" {...field} disabled={isLoading} />
                    </FormControl>
                     <FormDescription>
                      (حروف إنجليزية، أرقام، وشرطة سفلية فقط)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                 control={form.control}
                 name="email"
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel htmlFor="email">البريد الإلكتروني (اختياري)</FormLabel>
                     <FormControl>
                       <Input id="email" type="email" placeholder="example@mail.com" {...field} disabled={isLoading}/>
                     </FormControl>
                     <FormMessage />
                   </FormItem>
                 )}
               />
                <FormField
                 control={form.control}
                 name="name"
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel htmlFor="name">الاسم (اختياري)</FormLabel>
                     <FormControl>
                       <Input id="name" placeholder="اسمك الكامل" {...field} disabled={isLoading}/>
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
                      <Input id="password" type="password" placeholder="********" {...field} disabled={isLoading}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="confirmPassword">تأكيد كلمة المرور</FormLabel>
                    <FormControl>
                      <Input id="confirmPassword" type="password" placeholder="********" {...field} disabled={isLoading}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                 {isLoading ? 'جاري الإنشاء...' : (
                    <>
                      <UserPlus className="ml-2 h-4 w-4" />
                      إنشاء حساب
                    </>
                 )}
              </Button>
            </form>
          </Form>
           <div className="mt-4 text-center text-sm">
             لديك حساب بالفعل؟{' '}
             <Link href="/auth/signin" className="underline text-primary hover:text-primary/80">
               تسجيل الدخول
             </Link>
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
