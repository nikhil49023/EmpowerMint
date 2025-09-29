'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { LayoutGrid, Palette, Puzzle, Sparkles } from 'lucide-react';
import { generateSuggestionsAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import SuggestionCard from './suggestion-card';
import { Skeleton } from '@/components/ui/skeleton';
import type { GenerateSuggestionsFromPromptOutput } from '@/ai/flows/generate-suggestions-from-prompt';

const formSchema = z.object({
  prompt: z.string().min(10, {
    message: 'Prompt must be at least 10 characters.',
  }),
});

export default function AiSuggestionTool() {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<GenerateSuggestionsFromPromptOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setSuggestions(null);
    const result = await generateSuggestionsAction(values);
    setIsLoading(false);

    if (result.success) {
      setSuggestions(result.data);
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      });
    }
  }

  return (
    <Card className="w-full bg-card/70 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" />
          AI Suggestions
        </CardTitle>
        <CardDescription>Describe your app idea, and let AI suggest a starting point.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your App Idea</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., A minimalist to-do list app with collaboration features."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? 'Generating...' : 'Generate Suggestions'}
            </Button>
          </form>
        </Form>

        <div className="mt-6 space-y-4">
          {isLoading && (
            <>
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </>
          )}
          {suggestions && (
            <div className="flex flex-col gap-4 animate-in fade-in-50 duration-500">
              <SuggestionCard title="Layout" icon={<LayoutGrid />} content={suggestions.layoutSuggestion} />
              <SuggestionCard title="Components" icon={<Puzzle />} content={suggestions.componentSuggestions} />
              <SuggestionCard title="Styling" icon={<Palette />} content={suggestions.stylingSuggestions} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
