import prisma from '@/lib/prisma';
import PoemDisplay from '@/components/poems/poem-display';
import PaginationControls from '@/components/poems/pagination-controls';
import FilteringSortingControls from '@/components/poems/filtering-sorting-controls';
import { auth } from '@/lib/auth';
import type { Poem, User, Verse, Tag } from '@prisma/client'; // Import Tag type

// Define the expected structure including relations
type PoemWithDetails = Poem & {
    author: User;
    verses: Verse[];
    tags: Tag[]; // Tags are included
};


// Define types for search params
interface PoemsPageProps {
  searchParams: {
    page?: string;
    limit?: string;
    sortBy?: 'createdAt' | 'author' | 'title'; // Add more sort options if needed
    sortOrder?: 'asc' | 'desc';
    tag?: string; // Tag name for filtering
    author?: string;
    // Add more filter options like 'meter' if needed
  };
}

const POEMS_PER_PAGE = 10; // Number of poems per page

export default async function PoemsPage({ searchParams }: PoemsPageProps) {
    const session = await auth();
    const currentUserId = session?.user?.id;

    const page = parseInt(searchParams.page ?? '1', 10);
    const limit = parseInt(searchParams.limit ?? POEMS_PER_PAGE.toString(), 10);
    const skip = (page - 1) * limit;

    const sortBy = searchParams.sortBy || 'createdAt';
    const sortOrder = searchParams.sortOrder || 'desc';

    const whereClause: any = { published: true }; // Only show published poems by default
    if (searchParams.tag) {
        // Filter by poems that have *at least one* tag with the specified name (case-insensitive)
        whereClause.tags = {
            some: {
                name: {
                    equals: decodeURIComponent(searchParams.tag).trim().toLowerCase(),
                    mode: 'insensitive' // Optional: make tag filtering case-insensitive if desired
                }
            }
        };
    }
     if (searchParams.author) {
         // Find author ID first (case-insensitive search on username or name)
         const authorUser = await prisma.user.findFirst({
             where: {
                 OR: [
                    { username: { contains: decodeURIComponent(searchParams.author), mode: 'insensitive' } },
                    { name: { contains: decodeURIComponent(searchParams.author), mode: 'insensitive' } },
                ],
            },
            select: { id: true }
         });
         if (authorUser) {
            whereClause.authorId = authorUser.id;
         } else {
            // If author not found, return no poems (or handle as needed)
             whereClause.authorId = '-1'; // Use an ID that won't exist
         }
    }
    // Add more filters (e.g., meter) here based on searchParams

     let orderBy: any = {};
     if (sortBy === 'author') {
         orderBy = { author: { username: sortOrder } }; // Sort by author username
     } else if (sortBy === 'title') {
         orderBy = { title: sortOrder };
     } else {
         orderBy = { createdAt: sortOrder }; // Default sort by creation date
     }


    const poems = await prisma.poem.findMany({
        where: whereClause,
        include: {
            author: true, // Include author details
            verses: { // Include verses, sorted by order
                orderBy: {
                    order: 'asc',
                },
            },
            tags: true, // Include tags
        },
        orderBy: orderBy,
        skip: skip,
        take: limit,
    }) as PoemWithDetails[]; // Type assertion using the detailed type

    const totalPoems = await prisma.poem.count({ where: whereClause });
    const totalPages = Math.ceil(totalPoems / limit);

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-primary border-b-2 border-accent pb-2">
                مكتبة القصائد
            </h1>

            {/* Filtering and Sorting Controls */}
            <FilteringSortingControls />

            {poems.length > 0 ? (
                <div className="space-y-6">
                    {poems.map((poem) => (
                         // Pass currentUserId to PoemDisplay for edit/delete checks
                        <PoemDisplay key={poem.id} poem={poem} currentUserId={currentUserId} />
                    ))}
                </div>
            ) : (
                <p className="text-center text-muted-foreground text-lg mt-10">
                    {searchParams.tag || searchParams.author ? 'لم يتم العثور على قصائد تطابق معايير البحث.' : 'لا توجد قصائد منشورة بعد.'}
                </p>
            )}

            {/* Pagination */}
             {totalPages > 1 && (
                <PaginationControls
                    currentPage={page}
                    totalPages={totalPages}
                    baseUrl="/poems"
                />
            )}
        </div>
    );
}
