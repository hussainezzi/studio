'use client';

import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea'; // Use Textarea for Sadr/Ajz for potentially longer lines
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { PlusCircle, Trash2 } from 'lucide-react';
import { createPoemAction } from '@/actions/poemActions'; // Import server action
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { Badge } from '../ui/badge';

const verseSchema = z.object({
  sadr: z.string().min(1, { message: "الصدر مطلوب" }),
  ajz: z.string().min(1, { message: "العجز مطلوب" }),
});

const poemSchema = z.object({
  title: z.string().min(1, { message: "عنوان القصيدة مطلوب" }),
  verses: z.array(verseSchema).min(1, { message: "يجب إضافة بيت واحد على الأقل" }),
  tags: z.string().optional(), // Tags entered as a comma-separated string initially
});

type PoemFormValues = z.infer<typeof poemSchema>;

export default function CreateQasida() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [currentTags, setCurrentTags] = useState<string[]>([]);

  const form = useForm<PoemFormValues>({
    resolver: zodResolver(poemSchema),
    defaultValues: {
      title: '',
      verses: [{ sadr: '', ajz: '' }], // Start with one empty verse
      tags: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'verses',
  });

   // Handle tag input changes and update the visual tag list
   const handleTagsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    form.setValue('tags', event.target.value); // Update form state
    const tagsArray = event.target.value
      .split(',')
      .map(tag => tag.trim().toLowerCase()) // Convert to lowercase for consistency
      .filter(tag => tag.length > 0); // Remove empty tags
    setCurrentTags(Array.from(new Set(tagsArray))); // Remove duplicates for display
  };

  const onSubmit = async (data: PoemFormValues) => {
    setIsLoading(true);
    try {
       // Process tags: split string into an array, trim whitespace, lowercase, remove duplicates/empty
       const tagsArray = data.tags
        ? Array.from(new Set(data.tags.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag)))
        : [];

       const result = await createPoemAction({
         title: data.title,
         verses: data.verses.map((verse, index) => ({ ...verse, order: index + 1 })), // Add order
         tags: tagsArray, // Pass the processed array of tag names
         published: true, // Default to published, or add a checkbox later
       });

      if (result.success && result.poemId) {
        toast({
            title: "نجاح",
            description: "تم إضافة القصيدة بنجاح!",
            variant: "default", // or a custom success variant
        });
        router.push(`/poems/${result.poemId}`); // Redirect to the new poem's page
         router.refresh(); // Ensure poem list updates if navigating back
      } else {
         toast({
          title: "خطأ",
          description: result.error || "فشل إضافة القصيدة.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Create poem error:", error);
       toast({
          title: "خطأ",
          description: "حدث خطأ غير متوقع في الخادم.",
          variant: "destructive",
        });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg">عنوان القصيدة</FormLabel>
              <FormControl>
                <Input placeholder="أدخل عنوان القصيدة هنا" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Verses Section */}
        <div>
          <FormLabel className="text-lg mb-2 block">أبيات القصيدة</FormLabel>
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="flex flex-col md:flex-row items-start gap-4 p-4 border rounded-md bg-card/30 relative">
                 <span className="absolute top-2 right-2 text-xs text-muted-foreground font-mono bg-background px-1.5 py-0.5 rounded">
                    {index + 1}
                 </span>
                <div className="flex-1 w-full space-y-2">
                   <FormField
                      control={form.control}
                      name={`verses.${index}.sadr`}
                      render={({ field }) => (
                      <FormItem className="flex-1">
                          <FormLabel htmlFor={`verses.${index}.sadr`} >الصدر</FormLabel>
                          <FormControl>
                          <Textarea
                              id={`verses.${index}.sadr`}
                              placeholder="الشطر الأول من البيت"
                              className="min-h-[40px] resize-y" // Allow vertical resize
                              rows={1}
                              {...field}
                              disabled={isLoading}
                          />
                          </FormControl>
                          <FormMessage />
                      </FormItem>
                      )}
                  />
                   <FormField
                      control={form.control}
                      name={`verses.${index}.ajz`}
                      render={({ field }) => (
                      <FormItem className="flex-1">
                           <FormLabel htmlFor={`verses.${index}.ajz`}>العجز</FormLabel>
                          <FormControl>
                          <Textarea
                              id={`verses.${index}.ajz`}
                              placeholder="الشطر الثاني من البيت"
                              className="min-h-[40px] resize-y"
                              rows={1}
                              {...field}
                              disabled={isLoading}
                          />
                          </FormControl>
                          <FormMessage />
                      </FormItem>
                      )}
                  />
                </div>

                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => remove(index)}
                  className="mt-2 md:mt-6 shrink-0" // Adjust margin for alignment
                  disabled={fields.length <= 1 || isLoading} // Prevent removing the last verse
                  aria-label="حذف البيت"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
           {/* Display field array level errors */}
           {form.formState.errors.verses?.root?.message && (
             <p className="text-sm font-medium text-destructive mt-2">{form.formState.errors.verses.root.message}</p>
           )}
           {form.formState.errors.verses && typeof form.formState.errors.verses === 'string' && (
             <p className="text-sm font-medium text-destructive mt-2">{form.formState.errors.verses}</p>
            )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ sadr: '', ajz: '' })}
            className="mt-4"
            disabled={isLoading}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            إضافة بيت جديد
          </Button>
        </div>

        {/* Tags Section */}
         <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="tags" className="text-lg">الوسوم (Tags)</FormLabel>
              <FormControl>
                <Input
                  id="tags"
                  placeholder="أدخل الوسوم مفصولة بفواصل (مثال: غزل, مدح, العصر العباسي)"
                  {...field}
                  onChange={handleTagsChange} // Use custom handler
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>
                استخدم الفواصل (,) للفصل بين الوسوم المختلفة. سيتم تحويلها لحروف صغيرة وإزالة التكرار.
              </FormDescription>
              {/* Display current tags visually */}
               <div className="flex flex-wrap gap-2 mt-2">
                   {currentTags.map((tag, index) => (
                      <Badge key={index} variant="secondary">{tag}</Badge>
                   ))}
                </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" size="lg" className="w-full md:w-auto" disabled={isLoading}>
          {isLoading ? 'جاري الحفظ...' : 'حفظ القصيدة'}
        </Button>
      </form>
    </Form>
  );
}
