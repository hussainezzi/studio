'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationControlsProps {
    currentPage: number;
    totalPages: number;
    baseUrl: string; // Base URL for the page (e.g., /poems)
}

export default function PaginationControls({
    currentPage,
    totalPages,
    baseUrl,
}: PaginationControlsProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handlePageChange = (newPage: number) => {
        const currentParams = new URLSearchParams(Array.from(searchParams.entries())); // Create mutable copy
        currentParams.set('page', newPage.toString());
        router.push(`${baseUrl}?${currentParams.toString()}`);
    };

    const canGoPrevious = currentPage > 1;
    const canGoNext = currentPage < totalPages;

    return (
        <div className="flex items-center justify-center space-x-4 mt-8">
            <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!canGoPrevious}
                aria-label="الصفحة السابقة"
            >
                <ChevronRight className="h-4 w-4" /> {/* Icon reversed for RTL */}
            </Button>
            <span className="text-sm text-muted-foreground">
                صفحة {currentPage} من {totalPages}
            </span>
            <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!canGoNext}
                aria-label="الصفحة التالية"
            >
                 <ChevronLeft className="h-4 w-4" /> {/* Icon reversed for RTL */}
            </Button>
        </div>
    );
}
