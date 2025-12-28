'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Link as LinkIcon } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';

const profileFormSchema = z.object({
  experience: z.string({ required_error: 'Please select your years of experience.' }),
  affiliation: z.enum(['club', 'hs-varsity', 'college', 'former-player', 'other'], { required_error: 'Affiliation is required.' }),
  otherAffiliation: z.string().optional(),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  phone: z.string().min(10, { message: 'Please enter a valid phone number.' }),
  placedPlayerLevels: z.array(z.string()).refine(value => value.some(item => item), {
    message: 'You have to select at least one level.',
  }),
  profileLink: z.string().url({ message: 'Please enter a valid URL.' }).optional().or(z.literal('')),
}).refine(data => {
    if (data.affiliation === 'other') {
        return !!data.otherAffiliation && data.otherAffiliation.length > 0;
    }
    return true;
}, {
    message: 'Please specify your affiliation',
    path: ['otherAffiliation'],
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const placedPlayerLevelOptions = [
    { id: 'd1', label: 'NCAA Division I' },
    { id: 'd2', label: 'NCAA Division II' },
    { id: 'd3', label: 'NCAA Division III' },
    { id: 'naia', label: 'NAIA' },
    { id: 'pro', label: 'Professional' },
    { id: 'none', label: 'None' },
];

export function CoachProfileForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
        otherAffiliation: '',
        profileLink: '',
        placedPlayerLevels: [],
    }
  });

  async function onSubmit(data: ProfileFormValues) {
    setIsLoading(true);
    toast({
      title: 'Creating Profile...',
      description: 'Your coach profile is being created.',
    });

    try {
      // Simulate API call to create coach profile
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Coach Profile Data:', data);

      toast({
        title: 'Profile Created!',
        description: 'Welcome! You can now start reviewing player profiles.',
      });
      form.reset();
    } catch (error) {
      console.error('Failed to create coach profile:', error);
      toast({
        variant: 'destructive',
        title: 'Creation Failed',
        description: 'There was an error creating your profile. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }
  
  const affiliation = form.watch('affiliation');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <fieldset>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <FormField
                control={form.control}
                name="experience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Coaching Experience</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select years of experience" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        <SelectItem value="0-2">0-2 years</SelectItem>
                        <SelectItem value="3-5">3-5 years</SelectItem>
                        <SelectItem value="6-10">6-10 years</SelectItem>
                        <SelectItem value="10+">10+ years</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-8">
                 <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                        <Input placeholder="coach@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                        <Input placeholder="(123) 456-7890" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
              </div>
           </div>

            <FormField
                control={form.control}
                name="affiliation"
                render={({ field }) => (
                    <FormItem className="mt-8">
                    <FormLabel>Primary Affiliation</FormLabel>
                    <FormControl>
                        <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                        >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                            <RadioGroupItem value="club" />
                            </FormControl>
                            <FormLabel className="font-normal">Club</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                            <RadioGroupItem value="hs-varsity" />
                            </FormControl>
                            <FormLabel className="font-normal">HS Varsity</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                            <RadioGroupItem value="college" />
                            </FormControl>
                            <FormLabel className="font-normal">College</FormLabel>
                        </FormItem>
                         <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                            <RadioGroupItem value="former-player" />
                            </FormControl>
                            <FormLabel className="font-normal">Former Player</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                            <RadioGroupItem value="other" />
                            </FormControl>
                            <FormLabel className="font-normal">Other</FormLabel>
                        </FormItem>
                        </RadioGroup>
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
             />

            {affiliation === 'other' && (
                <FormField
                    control={form.control}
                    name="otherAffiliation"
                    render={({ field }) => (
                    <FormItem className="mt-4">
                        <FormLabel>Please specify your affiliation</FormLabel>
                        <FormControl>
                        <Input placeholder="e.g., Pro Team, Skills Clinic" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            )}
            
            <FormField
              control={form.control}
              name="placedPlayerLevels"
              render={() => (
                <FormItem className="mt-8">
                  <div className="mb-4">
                    <FormLabel>Have you had former players compete at the following levels?</FormLabel>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                  {placedPlayerLevelOptions.map((item) => (
                    <FormField
                      key={item.id}
                      control={form.control}
                      name="placedPlayerLevels"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={item.id}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(item.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, item.id])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== item.id
                                        )
                                      )
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {item.label}
                            </FormLabel>
                          </FormItem>
                        )
                      }}
                    />
                  ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

             <FormField
              control={form.control}
              name="profileLink"
              render={({ field }) => (
                <FormItem className="mt-8">
                  <FormLabel>Optional Profile Link</FormLabel>
                  <FormControl>
                    <div className="relative">
                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="https://linkedin.com/in/..." {...field} className="pl-10" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          
          <Button type="submit" disabled={isLoading} className="w-full md:w-auto mt-8">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Creating Profile...' : 'Submit Profile'}
          </Button>
        </fieldset>
      </form>
    </Form>
  );
}
