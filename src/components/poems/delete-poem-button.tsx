'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deletePoemAction } from '@/actions/poemActions';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';

interface DeletePoemButtonProps {
    poemId: string;
    poemTitle: string;
}

export default function DeletePoemButton({ poemId, poemTitle }: DeletePoemButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const handleDelete = async () => {
        setIsLoading(true);
        try {
            const result = await deletePoemAction(poemId);
            if (result.success) {
                toast({
                    title: "نجاح",
                    description: `تم حذف قصيدة "${poemTitle}" بنجاح.`,
                });
                router.push('/poems'); // Redirect to poems list after deletion
                router.refresh(); // Ensure list is updated
            } else {
                toast({
                    title: "خطأ",
                    description: result.error || "فشل حذف القصيدة.",
                    variant: "destructive",
                });
                 setIsAlertOpen(false); // Close dialog on error
            }
        } catch (error) {
            console.error("Delete poem error:", error);
            toast({
                title: "خطأ",
                description: "حدث خطأ غير متوقع في الخادم.",
                variant: "destructive",
            });
             setIsAlertOpen(false); // Close dialog on error
        } finally {
            setIsLoading(false);
            // No need to close dialog here if successful, as page redirects
        }
    };

    return (
        <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={isLoading}>
                    <Trash2 className="h-4 w-4 ml-1" />
                    حذف القصيدة
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent dir="rtl"> {/* Ensure dialog respects RTL */}
                <AlertDialogHeader>
                    <AlertDialogTitle>هل أنت متأكد تماماً؟</AlertDialogTitle>
                    <AlertDialogDescription>
                        سيؤدي هذا الإجراء إلى حذف قصيدة "{poemTitle}" بشكل دائم. لا يمكن التراجع عن هذا الإجراء.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                     {/* Cancel should be on the right in RTL */}
                    <AlertDialogCancel disabled={isLoading}>إلغاء</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isLoading}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {isLoading ? 'جاري الحذف...' : 'نعم، حذف القصيدة'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
