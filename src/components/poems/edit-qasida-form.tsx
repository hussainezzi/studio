'use client';

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { PlusCircle, Trash2, Save } from 'lucide-react';
import { updatePoemAction } from '@/actions/poemActions'; // Import update action
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import type { Poem, Verse, Tag } from '@prisma/client'; // Import Tag type
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch'; // Import Switch component

const verseSchema = z.object({
  sadr: z.string().min(1, { message: "الصدر مطلوب" }),
  ajz: z.string().min(1, { message: "العجز مطلوب" }),
  // No need for 'id' in the form schema itself unless you need to track specific existing verses during manipulation
});

const poemSchema = z.object({
  title: z.string().min(1, { message: "عنوان القصيدة مطلوب" }),
  verses: z.array(verseSchema).min(1, { message: "يجب إضافة بيت واحد على الأقل" }),
  tags: z.string().optional(),
  published: z.boolean().optional(),
});

type PoemFormValues = z.infer<typeof poemSchema>;

// Define the expected props type including relations
type PoemWithVersesAndTags = Poem & {
    verses: Verse[];
    tags: Tag[];
};

interface EditQasidaFormProps {
  poem: PoemWithVersesAndTags; // Use the detailed type for the poem prop
}

export default function EditQasidaForm({ poem }: EditQasidaFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
   // Initialize currentTags from the poem's related Tag objects
   const [currentTags, setCurrentTags] = useState<string[]>(poem.tags?.map(t => t.name) || []);

  const form = useForm<PoemFormValues>({
    resolver: zodResolver(poemSchema),
    defaultValues: {
      title: poem.title || '',
      // Map existing verses to the format expected by useFieldArray
      verses: poem.verses.sort((a, b) => a.order - b.order).map(v => ({ sadr: v.sadr, ajz: v.ajz })) || [{ sadr: '', ajz: '' }],
      tags: poem.tags?.map(t => t.name).join(', ') || '', // Join tag names into a string for the input
      published: poem.published ?? false,
    },
  });

   // Update currentTags when the tags input value changes
   useEffect(() => {
        const subscription = form.watch((value, { name }) => {
        if (name === 'tags') {
            const tagsArray = (value.tags || '')
            .split(',')
            .map(tag => tag.trim().toLowerCase()) // Lowercase for display consistency
            .filter(tag => tag.length > 0);
            setCurrentTags(Array.from(new Set(tagsArray))); // Remove duplicates for display
        }
        });
        return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.watch]); // Re-run effect if form.watch changes


  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'verses',
  });

  const onSubmit = async (data: PoemFormValues) => {
    setIsLoading(true);
    try {
        // Process tags: split string, trim, lowercase, remove duplicates/empty
        const tagsArray = data.tags
         ? Array.from(new Set(data.tags.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag)))
         : [];

      const result = await updatePoemAction({
        id: poem.id, // Pass the poem ID
        title: data.title,
        verses: data.verses.map((verse, index) => ({ ...verse, order: index + 1 })),
        tags: tagsArray, // Pass the processed array of tag names
        published: data.published,
      });

      if (result.success) {
        toast({
          title: "نجاح",
          description: "تم تحديث القصيدة بنجاح!",
        });
        router.push(`/poems/${poem.id}`); // Redirect to the poem's page
        router.refresh(); // Refresh data
      } else {
        toast({
          title: "خطأ",
          description: result.error || "فشل تحديث القصيدة.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Update poem error:", error);
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
                  className="mt-2 md:mt-6 shrink-0"
                  disabled={fields.length <= 1 || isLoading}
                  aria-label="حذف البيت"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
             {/* Display field array level errors */}
             {form.formState.errors.verses?.root?.message && (
                <p className="text-sm font-medium text-destructive mt-2">{form.formState.errors.verses.root.message}</p>
             )}
             {form.formState.errors.verses && typeof form.formState.errors.verses === 'string' && (
                <p className="text-sm font-medium text-destructive mt-2">{form.formState.errors.verses}</p>
            )}
          </div>

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
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>
                استخدم الفواصل (,) للفصل بين الوسوم المختلفة. سيتم تحويلها لحروف صغيرة وإزالة التكرار.
              </FormDescription>
               <div className="flex flex-wrap gap-2 mt-2">
                   {currentTags.map((tag, index) => (
                      <Badge key={index} variant="secondary">{tag}</Badge>
                   ))}
                </div>
              <FormMessage />
            </FormItem>
          )}
        />

         {/* Published Status */}
          <FormField
            control={form.control}
            name="published"
            render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm bg-card/30">
                <div className="space-y-0.5">
                    <FormLabel className="text-base">حالة النشر</FormLabel>
                    <FormDescription>
                    هل تريد أن تكون هذه القصيدة مرئية للجميع؟
                    </FormDescription>
                </div>
                <FormControl>
                    <Switch
                    checked={field.value ?? false} // Ensure controlled component has a boolean value
                    onCheckedChange={field.onChange}
                    disabled={isLoading}
                    />
                </FormControl>
                 <FormMessage />
                </FormItem>
            )}
            />


        <div className="flex justify-end gap-4">
             <Button
                type="button"
                variant="outline"
                onClick={() => router.back()} // Go back to previous page
                disabled={isLoading}
            >
                إلغاء
            </Button>
            <Button type="submit" size="lg" disabled={isLoading}>
                <Save className="ml-2 h-4 w-4" />
                {isLoading ? 'جاري الحفظ...' : 'حفظ التعديلات'}
            </Button>
        </div>
      </form>
    </Form>
  );
}
