'use server';

import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs'; // Use bcryptjs
import * as z from 'zod';

const signUpSchema = z.object({
  username: z.string().min(3).regex(/^[a-zA-Z0-9_]+$/),
  password: z.string().min(6),
  email: z.string().email().nullable(),
  name: z.string().nullable(),
});

type SignUpInput = z.infer<typeof signUpSchema>;

export async function signUpAction(
  input: SignUpInput
): Promise<{ success: boolean; error?: string | null }> {
  try {
    // Validate input on the server side as well
    const validation = signUpSchema.safeParse(input);
    if (!validation.success) {
      // Flatten errors for better readability if needed
      const errorMessages = validation.error.flatten().fieldErrors;
      // Combine messages into a single string (or handle differently)
      const combinedErrors = Object.values(errorMessages).flat().join(', ');
      return { success: false, error: combinedErrors || "بيانات الإدخال غير صالحة." };
    }

    const { username, password, email, name } = validation.data;

    // Check if username already exists
    const existingUserByUsername = await prisma.user.findUnique({
      where: { username },
    });
    if (existingUserByUsername) {
      return { success: false, error: 'اسم المستخدم محجوز بالفعل.' };
    }

    // Check if email already exists (if provided)
    if (email) {
        const existingUserByEmail = await prisma.user.findUnique({
            where: { email },
        });
        if (existingUserByEmail) {
            return { success: false, error: 'البريد الإلكتروني مسجل بالفعل.' };
        }
    }


    // Hash the password using bcryptjs
    const hashedPassword = await bcrypt.hash(password, 10); // Salt rounds: 10

    // Create the user in the database
    await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        email: email, // Prisma handles null correctly
        name: name,   // Prisma handles null correctly
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Sign-up action error:', error);
     // Check for specific Prisma errors like unique constraint violation
     if (error instanceof Error && 'code' in error && error.code === 'P2002') {
         // The fields causing the unique constraint violation are in error.meta.target
         const target = (error.meta as any)?.target;
         if (target?.includes('username')) {
             return { success: false, error: 'اسم المستخدم محجوز بالفعل.' };
         }
          if (target?.includes('email')) {
             return { success: false, error: 'البريد الإلكتروني مسجل بالفعل.' };
         }
     }
    return { success: false, error: 'فشل إنشاء الحساب بسبب خطأ في الخادم.' };
  }
}
