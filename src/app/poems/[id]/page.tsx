import prisma from '@/lib/prisma';
import PoemDisplay from '@/components/poems/poem-display';
import { notFound } from 'next/navigation';
import type { Poem, User, Verse, Tag } from '@prisma/client'; // Import Tag type
import { auth } from '@/lib/auth';
import DeletePoemButton from '@/components/poems/delete-poem-button'; // Import delete button

// Define the expected structure including relations
type PoemWithDetails = Poem & {
    author: User;
    verses: Verse[];
    tags: Tag[]; // Tags will be an array of Tag objects
};

interface PoemDetailsPageProps {
    params: {
        id: string; // Poem ID from the URL
    };
}

export async function generateMetadata({ params }: PoemDetailsPageProps) {
  const poem = await prisma.poem.findUnique({
    where: { id: params.id, published: true }, // Also ensure it's published for metadata generation usually
    select: { title: true, author: { select: { name: true, username: true } } },
  });

  if (!poem) {
    return { title: 'القصيدة غير موجودة' };
  }

  return {
    title: `${poem.title} - ${poem.author.name || poem.author.username} | ديوان العرب`,
    description: `قصيدة ${poem.title} للشاعر ${poem.author.name || poem.author.username}. اكتشف أبياتها وتفاصيلها.`,
  };
}


export default async function PoemDetailsPage({ params }: PoemDetailsPageProps) {
    const session = await auth();
    const currentUserId = session?.user?.id;

    const poem = await prisma.poem.findUnique({
        where: { id: params.id },
        include: {
            author: true,
            verses: {
                orderBy: {
                    order: 'asc',
                },
            },
            tags: true, // Include the related tags
        },
    }) as PoemWithDetails | null; // Type assertion with the detailed type

    if (!poem) {
        notFound(); // Show 404 page if poem doesn't exist
    }

    // Only show poem if it's published OR if the current user is the author
    if (!poem.published && poem.authorId !== currentUserId) {
         notFound(); // Or show an "access denied" message
    }


    return (
        <div className="max-w-4xl mx-auto">
            <PoemDisplay
                poem={poem}
                currentUserId={currentUserId}
                // Pass onDelete handler only if needed (e.g., if delete button is part of PoemDisplay)
                // onDelete={async (id) => { 'use server'; await deletePoemAction(id); /* handle result */ }}
            />
            {/* Example of having a separate delete button */}
             {currentUserId === poem.authorId && (
                 <div className="mt-4 flex justify-end">
                    <DeletePoemButton poemId={poem.id} poemTitle={poem.title} />
                </div>
             )}
        </div>
    );
}
