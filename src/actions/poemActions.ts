'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import * as z from 'zod';

// --- Validation Schemas ---

const verseInputSchema = z.object({
  sadr: z.string().min(1),
  ajz: z.string().min(1),
  order: z.number().int().positive(), // Order must be a positive integer
});

const createPoemSchema = z.object({
  title: z.string().min(1),
  verses: z.array(verseInputSchema).min(1),
  tags: z.array(z.string()), // Tags received as string array from form processing
  published: z.boolean().optional(),
});

const updatePoemSchema = z.object({
  id: z.string().cuid(),
  title: z.string().min(1).optional(),
  verses: z.array(verseInputSchema).min(1).optional(),
  tags: z.array(z.string()).optional(), // Tags received as string array from form processing
  published: z.boolean().optional(),
});

type CreatePoemInput = z.infer<typeof createPoemSchema>;
type UpdatePoemInput = z.infer<typeof updatePoemSchema>;

// --- Helper Function to Check Authentication ---
async function checkAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('المستخدم غير مصادق عليه.');
  }
  return session.user.id;
}

// --- Helper Function to manage tags ---
async function manageTags(tx: any, tagNames: string[]) {
    const tagConnectOrCreate = tagNames.map(name => ({
        where: { name: name.trim().toLowerCase() }, // Use lowercase for consistency
        create: { name: name.trim().toLowerCase() },
    }));
    return tagConnectOrCreate;
}


// --- Create Poem Action ---
export async function createPoemAction(
  input: CreatePoemInput
): Promise<{ success: boolean; error?: string | null; poemId?: string | null }> {
  let userId: string;
  try {
    userId = await checkAuth();
  } catch (error: any) {
    return { success: false, error: error.message };
  }

  try {
    // Validate input on the server side
    const validation = createPoemSchema.safeParse(input);
    if (!validation.success) {
      const errorMessages = validation.error.flatten().fieldErrors;
      const combinedErrors = Object.values(errorMessages).flat().join(', ');
      return { success: false, error: combinedErrors || 'بيانات إدخال القصيدة غير صالحة.' };
    }

    const { title, verses, tags, published } = validation.data;

    const poemId = await prisma.$transaction(async (tx) => {
        // Prepare tag connections
        const tagConnections = await manageTags(tx, tags);

        const newPoem = await tx.poem.create({
            data: {
                title,
                authorId: userId,
                published: published ?? false, // Default to not published if not provided
                verses: {
                create: verses.map((verse) => ({
                    sadr: verse.sadr,
                    ajz: verse.ajz,
                    order: verse.order,
                })),
                },
                tags: { // Connect or create tags
                    connectOrCreate: tagConnections,
                },
            },
            select: { id: true } // Only select the ID after creation
        });
        return newPoem.id;
    });


    // Revalidate paths to reflect the new poem
    revalidatePath('/poems');
    revalidatePath('/'); // Revalidate home page if it shows recent poems
    // revalidatePath(`/profile/${session.user.username}`); // If profile page exists

    return { success: true, poemId: poemId };
  } catch (error) {
    console.error('Create poem action error:', error);
    // Handle potential unique constraint violation for tags if needed, though connectOrCreate helps
    return { success: false, error: 'فشل إنشاء القصيدة بسبب خطأ في الخادم.', poemId: null };
  }
}

// --- Update Poem Action ---
export async function updatePoemAction(
  input: UpdatePoemInput
): Promise<{ success: boolean; error?: string | null }> {
    let userId: string;
    try {
        userId = await checkAuth();
    } catch (error: any) {
        return { success: false, error: error.message };
    }

    try {
        const validation = updatePoemSchema.safeParse(input);
        if (!validation.success) {
             const errorMessages = validation.error.flatten().fieldErrors;
             const combinedErrors = Object.values(errorMessages).flat().join(', ');
             return { success: false, error: combinedErrors || 'بيانات إدخال التحديث غير صالحة.' };
        }

        const { id: poemId, title, verses, tags, published } = validation.data;

        // Find the poem and verify ownership, include current tags for comparison
        const poem = await prisma.poem.findUnique({
            where: { id: poemId },
            select: { authorId: true, tags: { select: { name: true } } }
        });

        if (!poem) {
            return { success: false, error: 'القصيدة غير موجودة.' };
        }
        if (poem.authorId !== userId) {
            return { success: false, error: 'ليس لديك صلاحية لتعديل هذه القصيدة.' };
        }

        await prisma.$transaction(async (tx) => {
            // Prepare base update data
             const updateData: any = {};
             if (title !== undefined) updateData.title = title;
             if (published !== undefined) updateData.published = published;

             // Handle verses update (delete existing, create new ones if provided)
             if (verses !== undefined) {
                 // 1. Delete existing verses for this poem
                 await tx.verse.deleteMany({ where: { poemId: poemId } });
                 // 2. Create new verses
                 await tx.verse.createMany({
                    data: verses.map((verse) => ({
                        poemId: poemId,
                        sadr: verse.sadr,
                        ajz: verse.ajz,
                        order: verse.order,
                    })),
                 });
            }

            // Handle tag updates if tags are provided in the input
             if (tags !== undefined) {
                 const newTagConnections = await manageTags(tx, tags);
                 // Determine tags to disconnect (those currently connected but not in the new list)
                 const currentTagNames = poem.tags.map(t => t.name);
                 const tagsToDisconnect = currentTagNames
                    .filter(name => !tags.map(t => t.trim().toLowerCase()).includes(name))
                    .map(name => ({ name })); // Format for disconnect

                 updateData.tags = {
                     disconnect: tagsToDisconnect.length > 0 ? tagsToDisconnect : undefined,
                     connectOrCreate: newTagConnections,
                 };
             }

             // Update the poem metadata and potentially tags/verses
             await tx.poem.update({
                 where: { id: poemId },
                 data: updateData,
             });
        });


        // Revalidate relevant paths
        revalidatePath('/poems');
        revalidatePath(`/poems/${poemId}`);
        revalidatePath(`/poems/edit/${poemId}`); // Revalidate edit page too

        return { success: true };

    } catch (error) {
        console.error('Update poem action error:', error);
        return { success: false, error: 'فشل تحديث القصيدة بسبب خطأ في الخادم.' };
    }
}


// --- Delete Poem Action ---
export async function deletePoemAction(
  poemId: string
): Promise<{ success: boolean; error?: string | null }> {
  let userId: string;
  try {
    userId = await checkAuth();
  } catch (error: any) {
    return { success: false, error: error.message };
  }

   if (!poemId || typeof poemId !== 'string') {
       return { success: false, error: 'معرف القصيدة غير صالح.' };
   }

  try {
    // Find the poem to verify ownership before deleting
    const poem = await prisma.poem.findUnique({
      where: { id: poemId },
      select: { authorId: true }, // Select only necessary field
    });

    if (!poem) {
      return { success: false, error: 'القصيدة غير موجودة.' };
    }

    if (poem.authorId !== userId) {
      return { success: false, error: 'ليس لديك صلاحية لحذف هذه القصيدة.' };
    }

    // Delete the poem (verses will be deleted automatically due to onDelete: Cascade)
    // The relation to Tags is implicitly handled (relation entries removed)
    await prisma.poem.delete({
      where: { id: poemId },
    });

    // Revalidate paths
    revalidatePath('/poems');
    revalidatePath('/'); // Revalidate home potentially
    // revalidatePath(`/profile/${session.user.username}`); // If profile exists

    return { success: true };
  } catch (error) {
    console.error('Delete poem action error:', error);
     // Handle potential errors like poem not found during delete (though checked above)
    return { success: false, error: 'فشل حذف القصيدة بسبب خطأ في الخادم.' };
  }
}
