'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlayerFeedbackView } from './PlayerFeedbackView';
import { PlayerProfile } from '@/context/AppContext';
import { Separator } from '@/components/ui/separator';
import { PlayerProfileForm } from './PlayerProfileForm';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Edit, Upload } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useState } from 'react';
import { useUser, useFirestore, setDocumentNonBlocking, useFirebaseApp, useAuth } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { doc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import { Loader2 } from 'lucide-react';

interface PlayerDashboardProps {
    player: PlayerProfile;
    onProfileUpdate: () => void;
}

const playerAvatarPlaceholder = PlaceHolderImages.find((p) => p.id === 'player-avatar');

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


export function PlayerDashboard({ player, onProfileUpdate }: PlayerDashboardProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<string | undefined>(undefined);
    const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);

    const { toast } = useToast();
    const { user } = useUser();
    const auth = useAuth();
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
        if (!user || !auth.currentUser) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'You must be logged in to update a profile.',
            });
            return;
        }
    
        setIsLoading(true);
        toast({
          title: 'Processing Profile...',
          description: 'Your profile is being submitted.',
        });
    
        try {
            const playerProfileRef = doc(firestore, 'playerProfiles', user.uid);
            
            const profileDataToSave = {
                ...data,
                id: user.uid,
                userId: user.uid,
                submitted: true,
            };
            
            // First, save the text data
            await setDoc(playerProfileRef, profileDataToSave, { merge: true });
    
            if (profilePictureFile) {
                const resizedImage = await resizeImage(profilePictureFile, 400, 400);
                const storage = getStorage(firebaseApp);
                const storageRef = ref(storage, `profile-pictures/${user.uid}/${resizedImage.name}`);
                
                const uploadResult = await uploadBytes(storageRef, resizedImage);
                const pictureUrl = await getDownloadURL(uploadResult.ref);
                
                // Update Firestore document with the new URL
                await setDoc(playerProfileRef, { profilePictureUrl: pictureUrl }, { merge: true });
                
                // Also update the Firebase Auth user profile
                if (auth.currentUser) {
                    await updateProfile(auth.currentUser, { photoURL: pictureUrl });
                }
            }
    
          toast({
            title: 'Profile Updated!',
            description: 'Your changes have been saved.',
          });
    
          // Reload the page to ensure all components have the latest user data
          onProfileUpdate();
    
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

    const displayedAvatar = avatarPreview || player?.profilePictureUrl || playerAvatarPlaceholder?.imageUrl;

    return (
        <main className="flex-1 p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <Collapsible>
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-4">
                                     <div className="relative group">
                                        <Avatar className="h-20 w-20">
                                            <AvatarImage src={displayedAvatar} />
                                            <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <label htmlFor="pfp-upload-dashboard" className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition-opacity">
                                            <Upload className="w-6 h-6"/>
                                            <input 
                                                type="file" 
                                                accept="image/*" 
                                                className="hidden"
                                                id="pfp-upload-dashboard"
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0];
                                                    if(file) {
                                                        setProfilePictureFile(file);
                                                        const dataUri = await toBase64(file);
                                                        setAvatarPreview(dataUri);
                                                    }
                                                }}
                                            />
                                        </label>
                                    </div>
                                    <div>
                                        <CardTitle>Your Player Profile</CardTitle>
                                        <CardDescription>
                                            This is your active profile. Coaches view this to provide feedback.
                                        </CardDescription>
                                    </div>
                                </div>
                                <CollapsibleTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        <Edit className="w-4 h-4 mr-2" />
                                        Edit Profile
                                    </Button>
                                </CollapsibleTrigger>
                            </div>
                        </CardHeader>
                        <CollapsibleContent>
                            <CardContent>
                                <PlayerProfileForm form={form} onSubmit={onSubmit} isLoading={isLoading} />
                            </CardContent>
                        </CollapsibleContent>
                    </Card>
                </Collapsible>

                <Separator />

                <Card>
                    <CardHeader>
                        <CardTitle>Feedback &amp; Analysis</CardTitle>
                        <CardDescription>
                            Here is the feedback from coaches and your personalized training tips.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <PlayerFeedbackView player={player} />
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
