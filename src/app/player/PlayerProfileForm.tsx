'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { PlayerProfile } from '@/context/AppContext';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, Link as LinkIcon } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useUser, useFirestore, setDocumentNonBlocking, useFirebaseApp } from '@/firebase';
import { doc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';


const playerAvatar = PlaceHolderImages.find((p) => p.id === 'player-avatar');

const profileFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  position: z.string().min(2, { message: 'Position is required.' }),
  height: z.string().min(2, { message: 'Height is required.' }),
  gradYear: z.string().min(4, { message: 'Valid graduation year is required.' }),
  profilePicture: z.any().optional(),
  targetLevel: z.enum(['D1', 'D2', 'D3'], { required_error: 'Target level is required.' }),
  preferredSchools: z.string().min(3, { message: 'Please list at least one school.' }),
  highlightVideoUrl: z.string().url({ message: 'Please enter a valid video URL.' }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface PlayerProfileFormProps {
  player?: PlayerProfile;
  isDemo?: boolean;
  onProfileCreate?: () => void;
}

const resizeImage = (file: File, maxWidth: number, maxHeight: number): Promise<File> => {
    return new Promise((resolve, reject) => {
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let { width, height } = img;

            if (width > height) {
                if (width > maxWidth) {
                    height = Math.round(height * (maxWidth / width));
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width = Math.round(width * (maxHeight / height));
                    height = maxHeight;
                }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                return reject(new Error('Could not get canvas context'));
            }
            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob(blob => {
                if (!blob) {
                    return reject(new Error('Canvas to Blob conversion failed'));
                }
                const resizedFile = new File([blob], file.name, { type: file.type });
                resolve(resizedFile);
            }, file.type);
        };
        img.onerror = reject;
    });
};

export function PlayerProfileForm({ player, isDemo = false, onProfileCreate }: PlayerProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(player?.profilePictureUrl || playerAvatar?.imageUrl);
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  const firebaseApp = useFirebaseApp();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: player?.name || user?.displayName || '',
      position: player?.position || '',
      height: player?.height || '',
      gradYear: player?.gradYear || '',
      targetLevel: player?.targetLevel,
      preferredSchools: player?.preferredSchools || '',
      highlightVideoUrl: player?.highlightVideoUrl || '',
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
    if (isDemo || !user) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'You must be logged in to create a profile.',
        });
        return;
    }

    setIsLoading(true);
    toast({
      title: 'Processing Profile...',
      description: 'Your profile is being submitted.',
    });

    try {
        const { profilePicture, ...playerData } = data;
        const playerProfileRef = doc(firestore, 'playerProfiles', user.uid);
        
        // 1. Save the text data first (without the picture URL)
        const profileDataToSave = {
            ...playerData,
            userId: user.uid,
            submitted: true,
        };
        setDocumentNonBlocking(playerProfileRef, profileDataToSave, { merge: true });


        // 2. If there is a new picture, upload it and update the URL in a separate step
        if (profilePicture instanceof File) {
            const resizedImage = await resizeImage(profilePicture, 400, 400);

            const storage = getStorage(firebaseApp);
            const storageRef = ref(storage, `profile-pictures/${user.uid}/${resizedImage.name}`);
            
            uploadBytes(storageRef, resizedImage).then(uploadResult => {
                getDownloadURL(uploadResult.ref).then(pictureUrl => {
                    // 3. Update the document with the new picture URL
                    setDocumentNonBlocking(playerProfileRef, { profilePictureUrl: pictureUrl }, { merge: true });
                }).catch(error => {
                     console.error('Failed to get download URL:', error);
                     toast({ variant: 'destructive', title: 'Image URL Failed', description: 'Could not get the image URL. Please try re-uploading.' });
                });
            }).catch(error => {
                console.error('Failed to upload profile picture:', error);
                toast({ variant: 'destructive', title: 'Upload Failed', description: 'There was an error uploading your picture. Please try again.' });
            });
        }

      toast({
        title: 'Profile Submitted!',
        description: 'Your profile is now available for coaches to review.',
      });

      if (onProfileCreate) {
        onProfileCreate();
      }

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
        <fieldset disabled={isDemo}>
          <FormField
            control={form.control}
            name="profilePicture"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Profile Picture</FormLabel>
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={avatarPreview || undefined} data-ai-hint="volleyball player" />
                    <AvatarFallback>PFP</AvatarFallback>
                  </Avatar>
                  <FormControl>
                      <div className="relative">
                          <Input 
                              type="file" 
                              accept="image/*" 
                              className="hidden"
                              id="pfp-upload"
                              onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if(file) {
                                      field.onChange(file);
                                      const dataUri = await toBase64(file);
                                      setAvatarPreview(dataUri);
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
