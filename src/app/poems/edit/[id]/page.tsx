import EditQasidaForm from "@/components/poems/edit-qasida-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from 'next/navigation';
import { notFound } from 'next/navigation';
import type { Poem, Verse, Tag } from '@prisma/client'; // Import Tag type

// Define the expected structure including relations
type PoemWithVersesAndTags = Poem & {
    verses: Verse[];
    tags: Tag[]; // Include tags
};


interface EditPoemPageProps {
    params: {
        id: string; // Poem ID from the URL
    };
}

export default async function EditPoemPage({ params }: EditPoemPageProps) {
    const session = await auth();

    // Protect the route - redirect if not logged in
    if (!session?.user) {
        redirect(`/auth/signin?callbackUrl=/poems/edit/${params.id}`);
    }

     const poem = await prisma.poem.findUnique({
        where: { id: params.id },
        include: {
            verses: {
                orderBy: {
                    order: 'asc',
                },
            },
            tags: true, // Include tags
        },
    }) as PoemWithVersesAndTags | null; // Type assertion with detailed type

    if (!poem) {
        notFound(); // Show 404 page if poem doesn't exist
    }

     // Verify ownership - redirect if user is not the author
     if (poem.authorId !== session.user.id) {
         // Or show an access denied message instead of redirecting
          console.warn(`User ${session.user.id} attempted to edit poem ${poem.id} owned by ${poem.authorId}`);
          redirect('/poems?error=unauthorized'); // Redirect to poems list with error
     }


    return (
        <div className="max-w-4xl mx-auto">
             <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="text-3xl font-serif text-primary">تعديل القصيدة</CardTitle>
                    <CardDescription>قم بتحديث عنوان القصيدة وأبياتها ووسومها.</CardDescription>
                </CardHeader>
                <CardContent>
                    <EditQasidaForm poem={poem} />
                </CardContent>
             </Card>
        </div>
    );
}
