'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Filter, SortAsc, SortDesc } from 'lucide-react';
import React, { useState, useEffect } from 'react';

export default function FilteringSortingControls() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // --- State for controlled inputs ---
    const [tag, setTag] = useState(searchParams.get('tag') || '');
    const [author, setAuthor] = useState(searchParams.get('author') || '');
    const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'createdAt');
    const [sortOrder, setSortOrder] = useState(searchParams.get('sortOrder') || 'desc');

    // --- Effect to update state when searchParams change (e.g., browser back/forward) ---
    useEffect(() => {
        setTag(searchParams.get('tag') || '');
        setAuthor(searchParams.get('author') || '');
        setSortBy(searchParams.get('sortBy') || 'createdAt');
        setSortOrder(searchParams.get('sortOrder') || 'desc');
    }, [searchParams]);

    const handleApplyFilters = (e?: React.FormEvent<HTMLFormElement>) => {
         if (e) e.preventDefault(); // Prevent default form submission if used in a form

        const currentParams = new URLSearchParams(); // Start fresh

        // Add filters if they have values
        if (tag) currentParams.set('tag', tag);
        if (author) currentParams.set('author', author);

        // Add sorting (always present)
        currentParams.set('sortBy', sortBy);
        currentParams.set('sortOrder', sortOrder);

        // Reset page to 1 when filters/sorting change
        currentParams.set('page', '1');

        router.push(`/poems?${currentParams.toString()}`);
    };

    const handleClearFilters = () => {
        setTag('');
        setAuthor('');
        // Keep sorting or reset it? Let's keep it for now.
        // setSortBy('createdAt');
        // setSortOrder('desc');

        const currentParams = new URLSearchParams();
        // Re-apply sorting after clearing filters
        currentParams.set('sortBy', sortBy);
        currentParams.set('sortOrder', sortOrder);
        currentParams.set('page', '1');

        router.push(`/poems?${currentParams.toString()}`);
    };

    const toggleSortOrder = () => {
        const newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
        setSortOrder(newSortOrder);
        // Apply immediately or wait for apply button? Let's apply immediately for sort order toggle.
        const currentParams = new URLSearchParams(Array.from(searchParams.entries()));
        currentParams.set('sortOrder', newSortOrder);
        currentParams.set('sortBy', sortBy); // Ensure sortBy is included
        currentParams.set('page', '1');
        router.push(`/poems?${currentParams.toString()}`);
    }

     // Handle sort field change separately to apply immediately
     const handleSortByChange = (value: string) => {
        setSortBy(value);
        const currentParams = new URLSearchParams(Array.from(searchParams.entries()));
        currentParams.set('sortBy', value);
        currentParams.set('sortOrder', sortOrder); // Ensure sortOrder is included
        currentParams.set('page', '1');
        router.push(`/poems?${currentParams.toString()}`);
    };


    return (
        <Card className="mb-6 bg-card/50 border-border">
            <CardContent className="pt-6">
                 <form onSubmit={handleApplyFilters} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    {/* Filter by Tag */}
                    <div className="space-y-2">
                        <Label htmlFor="tag-filter">الوسم (Tag)</Label>
                        <Input
                            id="tag-filter"
                            placeholder="مثال: غزل, رثاء"
                            value={tag}
                            onChange={(e) => setTag(e.target.value)}
                        />
                    </div>

                    {/* Filter by Author */}
                    <div className="space-y-2">
                        <Label htmlFor="author-filter">الشاعر</Label>
                        <Input
                            id="author-filter"
                            placeholder="اسم الشاعر أو جزء منه"
                             value={author}
                            onChange={(e) => setAuthor(e.target.value)}
                        />
                    </div>

                    {/* Sort By */}
                    <div className="space-y-2">
                        <Label htmlFor="sort-by">ترتيب حسب</Label>
                        <div className="flex gap-2 items-center">
                            <Select value={sortBy} onValueChange={handleSortByChange}>
                                <SelectTrigger id="sort-by">
                                    <SelectValue placeholder="اختر حقل الترتيب" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="createdAt">تاريخ الإضافة</SelectItem>
                                    <SelectItem value="title">العنوان</SelectItem>
                                    <SelectItem value="author">الشاعر</SelectItem>
                                    {/* Add more sort options if needed */}
                                </SelectContent>
                            </Select>
                            <Button
                                type="button" // Important: prevent form submission
                                variant="outline"
                                size="icon"
                                onClick={toggleSortOrder}
                                aria-label={sortOrder === 'asc' ? 'ترتيب تصاعدي' : 'ترتيب تنازلي'}
                                title={sortOrder === 'asc' ? 'ترتيب تصاعدي' : 'ترتيب تنازلي'}
                            >
                                {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>


                    {/* Action Buttons */}
                    <div className="flex gap-2 md:col-span-2 lg:col-span-1 lg:justify-self-end">
                        <Button type="submit" className="flex-grow">
                            <Filter className="h-4 w-4 ml-2" /> تطبيق
                        </Button>
                        <Button type="button" variant="outline" onClick={handleClearFilters} className="flex-grow">
                            مسح الفلاتر
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
