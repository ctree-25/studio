'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAppContext } from '@/context/AppContext';
import { analyzePlayerFootage } from '@/ai/flows/analyze-player-footage';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const playerAvatar = PlaceHolderImages.find((p) => p.id === 'player-avatar');

const profileFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  position: z.string().min(2, { message: 'Position is required.' }),
  height: z.string().min(2, { message: 'Height is required.' }),
  gradYear: z.string().min(4, { message: 'Valid graduation year is required.' }),
  profilePicture: z.any().refine(file => file instanceof File, 'Profile picture is required.'),
  targetLevel: z.enum(['D1', 'D2', 'D3'], { required_error: 'Target level is required.' }),
  preferredSchools: z.string().min(3, { message: 'Please list at least one school.' }),
  highlightVideo: z.any().refine(file => file instanceof File, 'Highlight video is required.'),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export function PlayerProfileForm() {
  const { addPlayer, updatePlayer } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const [videoFileName, setVideoFileName] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(playerAvatar?.imageUrl || '');
  const { toast } = useToast();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: '',
      position: '',
      height: '',
      gradYear: '',
      preferredSchools: '',
    },
  });

  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });

  async function onSubmit(data: ProfileFormValues) {
    setIsLoading(true);
    toast({
      title: 'Processing Profile...',
      description: 'Your profile is being created and footage is being analyzed. This may take a moment.',
    });

    try {
      const { profilePicture, highlightVideo, ...playerData } = data;
      const newPlayer = addPlayer({ ...playerData, highlightVideo: null });
      
      const videoDataUri = await toBase64(highlightVideo);
      const videoObjectUrl = URL.createObjectURL(highlightVideo);

      const pictureObjectUrl = URL.createObjectURL(profilePicture);

      updatePlayer(newPlayer.id, { 
        highlightVideoUrl: videoObjectUrl, 
        videoDataUri: videoDataUri as string,
        profilePictureUrl: pictureObjectUrl
      });
      
      const analysisResult = await analyzePlayerFootage({
        videoDataUri: videoDataUri as string,
        targetLevel: data.targetLevel,
        preferredSchools: data.preferredSchools,
      });

      updatePlayer(newPlayer.id, {
        aiAnalysis: analysisResult,
        submitted: true,
      });

      toast({
        title: 'Profile Submitted!',
        description: 'Your profile and AI analysis are now available for coaches to review.',
      });
      form.reset();
      setVideoFileName('');
      setAvatarPreview(playerAvatar?.imageUrl || '');
    } catch (error) {
      console.error('Failed to process profile:', error);
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: 'There was an error processing your profile. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="profilePicture"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profile Picture</FormLabel>
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={avatarPreview} data-ai-hint="volleyball player" />
                  <AvatarFallback>PFP</AvatarFallback>
                </Avatar>
                <FormControl>
                    <div className="relative">
                        <Input 
                            type="file" 
                            accept="image/*" 
                            className="hidden"
                            id="pfp-upload"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if(file) {
                                    field.onChange(file);
                                    setAvatarPreview(URL.createObjectURL(file));
                                }
                            }}
                        />
                        <label htmlFor="pfp-upload" className="flex items-center justify-center px-3 py-2 text-sm border-2 border-dashed rounded-md cursor-pointer border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                            <Upload className="w-4 h-4 mr-2"/>
                            <span>Click to upload a picture</span>
                        </label>
                    </div>
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
        <FormField
          control={form.control}
          name="targetLevel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Target Level of Play</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
          name="highlightVideo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Highlight Footage</FormLabel>
              <FormControl>
                <div className="relative">
                    <Input 
                        type="file" 
                        accept="video/*" 
                        className="hidden"
                        id="file-upload"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if(file) {
                                field.onChange(file);
                                setVideoFileName(file.name);
                            }
                        }}
                    />
                    <label htmlFor="file-upload" className="flex items-center justify-center w-full px-3 py-2 text-sm border-2 border-dashed rounded-md cursor-pointer border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                        <Upload className="w-4 h-4 mr-2"/>
                        <span>{videoFileName || 'Click to upload a video'}</span>
                    </label>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading ? 'Analyzing...' : 'Submit Profile'}
        </Button>
      </form>
    </Form>
  );
}
