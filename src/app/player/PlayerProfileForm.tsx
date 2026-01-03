'use client';

import { useForm, UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Link as LinkIcon } from 'lucide-react';


const profileFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  position: z.string().min(2, { message: 'Position is required.' }),
  height: z.string().min(2, { message: 'Height is required.' }),
  gradYear: z.string().min(4, { message: 'Valid graduation year is required.' }),
  targetLevel: z.enum(['D1', 'D2', 'D3'], { required_error: 'Target level is required.' }),
  preferredSchools: z.string().min(3, { message: 'Please list at least one school.' }),
  highlightVideoUrl: z.string().url({ message: 'Please enter a valid video URL.' }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface PlayerProfileFormProps {
  form: UseFormReturn<ProfileFormValues>;
  onSubmit: (data: ProfileFormValues) => void;
  isLoading: boolean;
  isDemo?: boolean;
}

export function PlayerProfileForm({ form, onSubmit, isLoading, isDemo = false }: PlayerProfileFormProps) {

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <fieldset disabled={isDemo || isLoading}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Jane Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Position</FormLabel>
                    <FormControl>
                      <Input placeholder="Outside Hitter" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="height"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Height</FormLabel>
                    <FormControl>
                      <Input placeholder="5'11&quot;" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gradYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Graduation Year</FormLabel>
                    <FormControl>
                      <Input placeholder="2025" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
          </div>
          <div className="space-y-8 mt-8">
            <FormField
              control={form.control}
              name="targetLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Level of Play</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your target level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="D1">NCAA Division I</SelectItem>
                      <SelectItem value="D2">NCAA Division II</SelectItem>
                      <SelectItem value="D3">NCAA Division III</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="preferredSchools"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Schools</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="List schools you're interested in, separated by commas..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="highlightVideoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Highlight Video Link</FormLabel>
                  <FormControl>
                    <div className="relative">
                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="https://youtube.com/watch?v=..." {...field} className="pl-10" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button type="submit" disabled={isLoading || isDemo} className="w-full md:w-auto mt-8">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isDemo ? 'This is a Demo' : (isLoading ? 'Submitting...' : 'Submit Profile')}
          </Button>
        </fieldset>
      </form>
    </Form>
  );
}
