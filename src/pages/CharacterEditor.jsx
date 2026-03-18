import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useI18n } from '@/components/i18n/i18nProvider';
import { Character } from '@/entities/Character';
import useGamification from '@/hooks/useGamification';
import { GenerateImage, InvokeLLM } from '@/integrations/Core';
import { buildSafetyPromptPrefix, moderateInput } from '@/utils/content-moderation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Loader2, Sparkles, Wand2, User, Save, ArrowLeft, Trash2, Camera, Eye } from 'lucide-react';

export default function CharacterEditor() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { toast } = useToast();
    const { t, isRTL } = useI18n();
    const gamification = useGamification();

    const [character, setCharacter] = useState({
        id: null, // New: character ID, null for new characters
        name: '',
        gender: 'neutral',
        age: 5, // Changed default age
        personality: '',
        appearance: '',
        art_style: 'cartoon',
        primary_image_url: ''
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false); // New: state for image generation
    const [isGeneratingDetails, setIsGeneratingDetails] = useState(false); // New: state for details generation

    useEffect(() => {
        const id = searchParams.get('id');
        const name = searchParams.get('name');
        const data = searchParams.get('data');

        const loadCharacter = async (characterId) => {
            try {
                const fetchedCharacter = await Character.get(characterId);
                setCharacter(fetchedCharacter);
            } catch (error) {
                toast({
                    title: t("characterEditor.errorLoad"),
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            loadCharacter(id);
        } else if (data) {
            try {
                const parsedData = JSON.parse(decodeURIComponent(data));
                setCharacter(prev => ({ ...prev, ...parsedData }));
            } catch (error) {
                // silently handled
            } finally {
                setIsLoading(false);
            }
        } else if (name) {
            setCharacter(prev => ({ ...prev, name: decodeURIComponent(name) }));
            setIsLoading(false);
        } else {
            setIsLoading(false);
        }
    }, [searchParams]);

    const handleInputChange = (field, value) => {
        setCharacter(prev => ({ ...prev, [field]: value }));
    };

    const generateCharacterImage = useCallback(async () => {
        setIsGeneratingImage(true);
        try {
            const safetyPrefix = buildSafetyPromptPrefix('5-10');
            const prompt = safetyPrefix + `A ${character.gender === 'boy' ? 'boy' : character.gender === 'girl' ? 'girl' : 'child'} character named ${character.name}, age ${character.age}, with ${character.appearance}. Style: ${character.art_style}. Child-friendly, wholesome illustration.`;
            const response = await GenerateImage({
                prompt: prompt,
                quality: 'standard',
                size: '1024x1024'
            });
            const imageUrl = typeof response === 'string' ? response : response.url;
            setCharacter(prev => ({ ...prev, primary_image_url: imageUrl }));
            toast({
                title: t("characterEditor.imageGenerated"),
                description: t("characterEditor.imageGeneratedDesc"),
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: t("characterEditor.imageGenerateFailed"),
                description: t("characterEditor.tryAgain"),
            });
        } finally {
            setIsGeneratingImage(false);
        }
    }, [character]);

    const generateCharacterDetails = useCallback(async () => {
        setIsGeneratingDetails(true);
        try {
            const safetyPrefix = buildSafetyPromptPrefix('5-10');
            const prompt = safetyPrefix + `Generate a name, age (a number between 4 and 10), gender (boy/girl/neutral), personality, and appearance for a fictional child character. Focus on positive, child-friendly traits. Provide the output as a JSON object with keys: "name", "age", "gender", "personality", "appearance". Example: {"name": "Lily", "age": 7, "gender": "girl", "personality": "Brave and adventurous, loves to explore.", "appearance": "Long brown hair, big blue eyes, wears a red dress."}`;
            
            const parsedDetails = await InvokeLLM({
                prompt: prompt,
                temperature: 0.7,
                max_tokens: 500,
                response_json_schema: {
                    type: "object",
                    properties: {
                        name: { type: "string" },
                        age: { type: "number" },
                        gender: { type: "string" },
                        personality: { type: "string" },
                        appearance: { type: "string" }
                    }
                }
            });
            setCharacter(prev => ({
                ...prev,
                name: parsedDetails.name || prev.name,
                age: parsedDetails.age || prev.age,
                gender: parsedDetails.gender || prev.gender,
                personality: parsedDetails.personality || prev.personality,
                appearance: parsedDetails.appearance || prev.appearance,
            }));
            toast({
                title: t("characterEditor.detailsGenerated"),
                description: t("characterEditor.detailsGeneratedDesc"),
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: t("characterEditor.detailsGenerateFailed"),
                description: t("characterEditor.tryAgain"),
            });
        } finally {
            setIsGeneratingDetails(false);
        }
    }, []);

    const handleSave = async () => {
        if (!character.name || !character.personality || !character.appearance) {
             toast({ 
                 variant: "destructive", 
                 title: t("characterEditor.missingInfo"), 
                 description: t("characterEditor.missingFields")
             });
             return;
        }

        setIsSaving(true);
        try {
            const isNewCharacter = character.id === null;
            if (isNewCharacter) {
                const newCharacter = await Character.create(character);
                toast({
                    title: t("characterEditor.successCreate")
                });
                // Award XP for creating a new character
                gamification.awardXP("character_created");
                gamification.incrementStat("totalCharacters");
                setCharacter(prev => ({ ...prev, id: newCharacter.id })); // Update character with new ID
                navigate(`${createPageUrl('CharacterEditor')}?id=${newCharacter.id}`);
            } else {
                await Character.update(character.id, character);
                toast({ 
                    title: t("characterEditor.successUpdate")
                });
            }
        } catch (error) {
            toast({ 
                variant: "destructive", 
                title: (character.id === null) ? t("characterEditor.errorCreate") : t("characterEditor.errorUpdate")
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await Character.delete(character.id);
            toast({
                title: t("characterEditor.successDelete")
            });
            navigate(createPageUrl('Characters'));
        } catch (error) {
            toast({
                variant: "destructive",
                title: t("characterEditor.errorDelete")
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const isNew = character.id === null;

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-dvh">
                <Loader2 className="h-12 w-12 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-6" dir={isRTL ? "rtl" : "ltr"}>
            <Button variant="ghost" onClick={() => navigate(createPageUrl('Characters'))} className={`mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <ArrowLeft className={`${isRTL ? 'ms-2 rotate-180' : 'me-2'} h-4 w-4`} />
                {t("characterEditor.back")}
            </Button>
            
            <h1 className="text-3xl font-bold mb-6">
                {isNew ? t("characterEditor.createNew") : t("characterEditor.editCharacter")}
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t("characterEditor.basicInfo")}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="name">{t("characterEditor.name")}</Label>
                                <Input 
                                    id="name" 
                                    value={character.name} 
                                    onChange={(e) => handleInputChange('name', e.target.value)} 
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="age">{t("characterEditor.age")}</Label>
                                    <Input 
                                        id="age" 
                                        type="number" 
                                        value={character.age} 
                                        onChange={(e) => handleInputChange('age', e.target.valueAsNumber || '')} 
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="gender">{t("characterEditor.gender")}</Label>
                                    <Select value={character.gender} onValueChange={(val) => handleInputChange('gender', val)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="boy">{t("characterEditor.boy")}</SelectItem>
                                            <SelectItem value="girl">{t("characterEditor.girl")}</SelectItem>
                                            <SelectItem value="neutral">{t("characterEditor.neutral")}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader>
                            <CardTitle>{t("characterEditor.personalityAppearance")}</CardTitle>
                            <CardDescription>{t("characterEditor.personalityDesc")}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div>
                                <Label htmlFor="personality">{t("characterEditor.personality")}</Label>
                                <Textarea 
                                    id="personality" 
                                    placeholder={t("characterEditor.personalityPlaceholder")}
                                    value={character.personality} 
                                    onChange={(e) => handleInputChange('personality', e.target.value)} 
                                    rows={4}
                                />
                            </div>
                             <div>
                                <Label htmlFor="appearance">{t("characterEditor.appearance")}</Label>
                                <Textarea 
                                    id="appearance" 
                                    placeholder={t("characterEditor.appearancePlaceholder")}
                                    value={character.appearance} 
                                    onChange={(e) => handleInputChange('appearance', e.target.value)} 
                                    rows={4}
                                />
                            </div>
                            <div className="flex justify-end">
                                <Button 
                                    onClick={generateCharacterDetails} 
                                    disabled={isGeneratingDetails} 
                                    variant="outline"
                                    className="gap-2"
                                >
                                    {isGeneratingDetails && <Loader2 className="h-4 w-4 animate-spin" />}
                                    {!isGeneratingDetails && <Sparkles className="h-4 w-4" />}
                                    {t("characterEditor.generateDetails")}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                
                <div className="space-y-6">
                     <Card>
                        <CardHeader>
                            <CardTitle>{t("characterEditor.visuals")}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div>
                                <Label htmlFor="art_style">{t("characterEditor.artStyle")}</Label>
                                <Select value={character.art_style} onValueChange={(val) => handleInputChange('art_style', val)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="cartoon">{t("characterEditor.styleCartoon")}</SelectItem>
                                        <SelectItem value="disney">{t("characterEditor.styleDisney")}</SelectItem>
                                        <SelectItem value="pixar">{t("characterEditor.stylePixar")}</SelectItem>
                                        <SelectItem value="watercolor">{t("characterEditor.styleWatercolor")}</SelectItem>
                                        <SelectItem value="sketch">{t("characterEditor.styleSketch")}</SelectItem>
                                        <SelectItem value="realistic">{t("characterEditor.styleRealistic")}</SelectItem>
                                        <SelectItem value="anime">{t("characterEditor.styleAnime")}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex flex-col items-center gap-4">
                                <Avatar className="h-48 w-48 border-2 border-primary">
                                    <AvatarImage src={character.primary_image_url} alt={character.name} />
                                    <AvatarFallback className="text-6xl">
                                        <User className="h-24 w-24 text-gray-400" />
                                    </AvatarFallback>
                                </Avatar>
                                <Input
                                    placeholder={t("characterEditor.imageUrlPlaceholder")}
                                    value={character.primary_image_url}
                                    onChange={(e) => handleInputChange('primary_image_url', e.target.value)}
                                />
                                <div className="flex gap-2 w-full">
                                    <Button 
                                        onClick={generateCharacterImage} 
                                        disabled={isGeneratingImage || !character.name || !character.appearance} 
                                        className="flex-1"
                                    >
                                        {isGeneratingImage && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                                        <Wand2 className="me-2 h-4 w-4" /> {t("characterEditor.generateImage")}
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        className="flex-1" 
                                        onClick={() => window.open(character.primary_image_url, '_blank', 'noopener,noreferrer')}
                                        disabled={!character.primary_image_url}
                                    >
                                        <Eye className="me-2 h-4 w-4" /> {t("characterEditor.viewImage")}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                     
                     <div className="flex flex-col space-y-2">
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                            {isNew ? t("characterEditor.createCharacter") : t("characterEditor.saveChanges")}
                        </Button>
                        {!isNew && (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" disabled={isDeleting}>
                                        {isDeleting && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                                        {t("characterEditor.deleteCharacter")}
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>{t("characterEditor.deleteCharacter")}</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            {t("characterEditor.deleteConfirm")}
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>{t("characterEditor.cancelBtn")}</AlertDialogCancel>
                                        <AlertDialogAction
                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                            onClick={handleDelete}
                                        >
                                            {t("characterEditor.deleteCharacter")}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}