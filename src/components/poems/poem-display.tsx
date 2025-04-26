import type { Poem, Verse, User, Tag } from '@prisma/client'; // Import Tag type
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale'; // Import Arabic locale for date-fns
import Link from 'next/link';
import { Button } from '../ui/button';
import { Pencil, Trash2 } from 'lucide-react';

// Define a more specific type for the poem prop including related data
type PoemWithDetails = Poem & {
    author: User;
    verses: Verse[];
    tags: Tag[]; // Tags are now an array of Tag objects
};

interface PoemDisplayProps {
    poem: PoemWithDetails;
    currentUserId?: string | null; // ID of the currently logged-in user (optional)
    onDelete?: (poemId: string) => void; // Optional delete handler
}

export default function PoemDisplay({ poem, currentUserId, onDelete }: PoemDisplayProps) {
    const canEditOrDelete = currentUserId && poem.authorId === currentUserId;

    const formatDate = (date: Date | null | undefined) => {
        if (!date) return 'غير معروف';
        return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ar });
    };

    const handleDelete = () => {
        if (canEditOrDelete && onDelete) {
            // Optional: Add confirmation dialog here
            if (window.confirm(`هل أنت متأكد من حذف قصيدة "${poem.title}"؟ لا يمكن التراجع عن هذا الإجراء.`)) {
                 onDelete(poem.id);
            }
        }
    }

    return (
        <Card className="w-full mb-6 shadow-md border border-border hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                         <Link href={`/poems/${poem.id}`} className="hover:underline">
                            <CardTitle className="text-3xl font-serif mb-2 text-primary">{poem.title}</CardTitle>
                         </Link>
                         <CardDescription className="text-sm text-muted-foreground">
                             {/* TODO: Add link to author profile page if implemented */}
                             <span> للشاعر: {poem.author.name || poem.author.username}</span>
                             <span className="mx-2">|</span>
                             <span>نُشرت: {formatDate(poem.createdAt)}</span>
                             {poem.updatedAt && poem.updatedAt.getTime() !== poem.createdAt.getTime() && (
                                <>
                                    <span className="mx-2">|</span>
                                    <span>آخر تحديث: {formatDate(poem.updatedAt)}</span>
                                </>
                             )}
                         </CardDescription>
                    </div>
                     {canEditOrDelete && (
                        <div className="flex gap-2 flex-shrink-0">
                             <Link href={`/poems/edit/${poem.id}`}>
                                <Button variant="outline" size="sm">
                                    <Pencil className="h-4 w-4 ml-1" />
                                    تعديل
                                </Button>
                            </Link>
                            {/* Delete button is now handled outside, e.g., on the poem detail page */}
                            {/* {onDelete && (
                                <Button variant="destructive" size="sm" onClick={handleDelete}>
                                    <Trash2 className="h-4 w-4 ml-1" />
                                    حذف
                                </Button>
                            )} */}
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-2 font-serif text-lg leading-relaxed text-justify text-foreground">
                    {poem.verses
                        .sort((a, b) => a.order - b.order) // Ensure verses are sorted by order
                        .map((verse) => (
                            <div key={verse.id} className="flex flex-col sm:flex-row sm:justify-between">
                                <span className="sm:w-1/2 mb-1 sm:mb-0 sm:pl-4">{verse.sadr}</span>
                                <span className="sm:w-1/2 sm:pr-4">{verse.ajz}</span>
                            </div>
                        ))}
                </div>
            </CardContent>
            {poem.tags && poem.tags.length > 0 && (
                <CardFooter className="flex flex-wrap gap-2 pt-4 border-t border-border mt-4">
                     {/* Map through Tag objects */}
                    {poem.tags.map((tag) => (
                        <Link key={tag.id} href={`/poems?tag=${encodeURIComponent(tag.name)}`}>
                             <Badge variant="secondary" className="cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors">
                                {tag.name}
                            </Badge>
                        </Link>
                    ))}
                </CardFooter>
            )}
        </Card>
    );
}
