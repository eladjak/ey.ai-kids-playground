import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Character } from '@/entities/Character';
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
    const { toast } = useToast();
    
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
    const [currentLanguage, setCurrentLanguage] = useState("english");

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');
        const name = urlParams.get('name');
        const data = urlParams.get('data');
        const storedLanguage = localStorage.getItem('language') || 'english';
        setCurrentLanguage(storedLanguage);

        const loadCharacter = async (characterId) => {
            try {
                const fetchedCharacter = await Character.get(characterId);
                setCharacter(fetchedCharacter);
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to load character.",
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
    }, []);

    const translations = {
        english: {
            "characterEditor.title": "Character Editor",
            "characterEditor.createNew": "Create New Character",
            "characterEditor.editCharacter": "Edit Character",
            "characterEditor.back": "Back to Characters",
            "characterEditor.basicInfo": "Basic Information",
            "characterEditor.name": "Name",
            "characterEditor.age": "Age",
            "characterEditor.gender": "Gender",
            "characterEditor.boy": "Boy",
            "characterEditor.girl": "Girl",
            "characterEditor.neutral": "Neutral",
            "characterEditor.personalityAppearance": "Personality & Appearance",
            "characterEditor.personalityDesc": "These details will help the AI create consistent stories and images.",
            "characterEditor.personality": "Personality",
            "characterEditor.personalityPlaceholder": "e.g., Brave, curious, loves animals, a bit shy...",
            "characterEditor.appearance": "Appearance",
            "characterEditor.appearancePlaceholder": "e.g., Red curly hair, green eyes, wears glasses, has freckles...",
            "characterEditor.visuals": "Visuals",
            "characterEditor.artStyle": "Preferred Art Style",
            "characterEditor.createCharacter": "Create Character",
            "characterEditor.saveChanges": "Save Changes",
            "characterEditor.deleteCharacter": "Delete Character",
            "characterEditor.deleteConfirm": "Are you sure you want to delete this character?",
            "characterEditor.successCreate": "Character created successfully.",
            "characterEditor.successUpdate": "Character updated successfully.",
            "characterEditor.successDelete": "Character deleted.",
            "characterEditor.errorCreate": "Failed to create character.",
            "characterEditor.errorUpdate": "Failed to update character.",
            "characterEditor.errorDelete": "Failed to delete character.",
            "characterEditor.errorLoad": "Failed to load character.",
            "characterEditor.missingInfo": "Missing Information",
            "characterEditor.missingFields": "Please fill in Name, Personality, and Appearance.",
            "characterEditor.saving": "Saving...",
            "characterEditor.deleting": "Deleting..."
        },
        hebrew: {
            "characterEditor.title": "עורך דמויות",
            "characterEditor.createNew": "צור דמות חדשה",
            "characterEditor.editCharacter": "ערוך דמות",
            "characterEditor.back": "חזור לדמויות",
            "characterEditor.basicInfo": "מידע בסיסי",
            "characterEditor.name": "שם",
            "characterEditor.age": "גיל",
            "characterEditor.gender": "מין",
            "characterEditor.boy": "בן",
            "characterEditor.girl": "בת",
            "characterEditor.neutral": "ניטרלי",
            "characterEditor.personalityAppearance": "אישיות ומראה",
            "characterEditor.personalityDesc": "פרטים אלו יעזרו לבינה המלאכותית ליצור סיפורים ותמונות עקביים.",
            "characterEditor.personality": "אישיות",
            "characterEditor.personalityPlaceholder": "למשל: אמיץ, סקרן, אוהב חיות, קצת ביישן...",
            "characterEditor.appearance": "מראה",
            "characterEditor.appearancePlaceholder": "למשל: שיער מתולתל אדום, עיניים ירוקות, משקפיים, נמשים...",
            "characterEditor.visuals": "חזותיות",
            "characterEditor.artStyle": "סגנון איור מועדף",
            "characterEditor.createCharacter": "צור דמות",
            "characterEditor.saveChanges": "שמור שינויים",
            "characterEditor.deleteCharacter": "מחק דמות",
            "characterEditor.deleteConfirm": "האם אתה בטוח שברצונך למחוק את הדמות הזאת?",
            "characterEditor.successCreate": "הדמות נוצרה בהצלחה.",
            "characterEditor.successUpdate": "הדמות עודכנה בהצלחה.",
            "characterEditor.successDelete": "הדמות נמחקה.",
            "characterEditor.errorCreate": "יצירת הדמות נכשלה.",
            "characterEditor.errorUpdate": "עדכון הדמות נכשל.",
            "characterEditor.errorDelete": "מחיקת הדמות נכשלה.",
            "characterEditor.errorLoad": "טעינת הדמות נכשלה.",
            "characterEditor.missingInfo": "מידע חסר",
            "characterEditor.missingFields": "אנא מלא את השם, האישיות והמראה.",
            "characterEditor.saving": "שומר...",
            "characterEditor.deleting": "מוחק..."
        }
    };

    const t = (key) => {
        return translations[currentLanguage]?.[key] || translations.english[key] || key;
    };

    const isRTL = currentLanguage === "hebrew";

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
                title: "Image generated successfully!",
                description: "The character's image has been updated.",
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Failed to generate image",
                description: "Please try again.",
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
            
            const generatedJson = await InvokeLLM({
                prompt: prompt,
                temperature: 0.7,
                max_tokens: 500,
                response_format: { type: "json_object" }
            });

            const parsedDetails = JSON.parse(generatedJson);
            setCharacter(prev => ({
                ...prev,
                name: parsedDetails.name || prev.name,
                age: parsedDetails.age || prev.age,
                gender: parsedDetails.gender || prev.gender,
                personality: parsedDetails.personality || prev.personality,
                appearance: parsedDetails.appearance || prev.appearance,
            }));
            toast({
                title: "Details generated successfully!",
                description: "The character's details have been updated.",
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Failed to generate details",
                description: "Please try again.",
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
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-12 w-12 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-6" dir={isRTL ? "rtl" : "ltr"}>
            <Button variant="ghost" onClick={() => navigate(createPageUrl('Characters'))} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
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
                                    Generate Details
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
                                        <SelectItem value="cartoon">Cartoon</SelectItem>
                                        <SelectItem value="disney">Disney</SelectItem>
                                        <SelectItem value="pixar">Pixar</SelectItem>
                                        <SelectItem value="watercolor">Watercolor</SelectItem>
                                        <SelectItem value="sketch">Sketch</SelectItem>
                                        <SelectItem value="realistic">Realistic</SelectItem>
                                        <SelectItem value="anime">Anime</SelectItem>
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
                                    placeholder="Image URL (optional)"
                                    value={character.primary_image_url}
                                    onChange={(e) => handleInputChange('primary_image_url', e.target.value)}
                                />
                                <div className="flex gap-2 w-full">
                                    <Button 
                                        onClick={generateCharacterImage} 
                                        disabled={isGeneratingImage || !character.name || !character.appearance} 
                                        className="flex-1"
                                    >
                                        {isGeneratingImage && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        <Wand2 className="mr-2 h-4 w-4" /> Generate Image
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        className="flex-1" 
                                        onClick={() => window.open(character.primary_image_url, '_blank', 'noopener,noreferrer')}
                                        disabled={!character.primary_image_url}
                                    >
                                        <Eye className="mr-2 h-4 w-4" /> View
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                     
                     <div className="flex flex-col space-y-2">
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isNew ? t("characterEditor.createCharacter") : t("characterEditor.saveChanges")}
                        </Button>
                        {!isNew && (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" disabled={isDeleting}>
                                        {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
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