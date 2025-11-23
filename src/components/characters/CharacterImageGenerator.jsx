import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { GenerateImage, UploadFile, InvokeLLM } from '@/integrations/Core';
import { Loader2, Wand2, User, Upload, Camera, Sparkles, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function CharacterImageGenerator({ 
    character, 
    onImageGenerated, 
    currentLanguage = "english", 
    isRTL = false 
}) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [activeTab, setActiveTab] = useState("generate");
    const [error, setError] = useState("");
    const fileInputRef = useRef(null);
    const { toast } = useToast();

    const translations = {
        english: {
            "generator.generate": "Generate",
            "generator.upload": "Upload",
            "generator.generateFromDescription": "Generate from Description",
            "generator.uploadReference": "Upload Reference Image",
            "generator.generateButton": "Generate Image",
            "generator.generating": "Generating...",
            "generator.uploadImage": "Upload Image",
            "generator.uploadButton": "Choose File",
            "generator.uploading": "Uploading...",
            "generator.dragDrop": "Drag and drop an image here, or click to browse",
            "generator.supportedFormats": "Supported formats: JPG, PNG, WebP",
            "generator.generateFromUpload": "Generate Character from Image",
            "generator.currentImage": "Current Image",
            "generator.noImage": "No image generated yet",
            "generator.missingInfo": "Please provide a name and appearance description",
            "generator.generationFailed": "Image generation failed",
            "generator.uploadFailed": "Image upload failed",
            "generator.tryAgain": "Please try again",
            "generator.analyzeAndGenerate": "Analyze & Generate",
            "generator.analyzing": "Analyzing image...",
            "generator.helpText": "Upload a reference image and we'll create a character based on it"
        },
        hebrew: {
            "generator.generate": "יצירה",
            "generator.upload": "העלאה",
            "generator.generateFromDescription": "יצירה מתיאור",
            "generator.uploadReference": "העלאת תמונת ייחוס",
            "generator.generateButton": "צור תמונה",
            "generator.generating": "יוצר...",
            "generator.uploadImage": "העלאת תמונה",
            "generator.uploadButton": "בחר קובץ",
            "generator.uploading": "מעלה...",
            "generator.dragDrop": "גרור ושחרר תמונה כאן, או לחץ לעיון",
            "generator.supportedFormats": "פורמטים נתמכים: JPG, PNG, WebP",
            "generator.generateFromUpload": "צור דמות מתמונה",
            "generator.currentImage": "התמונה הנוכחית",
            "generator.noImage": "עדיין לא נוצרה תמונה",
            "generator.missingInfo": "אנא ספק שם ותיאור מראה",
            "generator.generationFailed": "יצירת התמונה נכשלה",
            "generator.uploadFailed": "העלאת התמונה נכשלה",
            "generator.tryAgain": "אנא נסה שוב",
            "generator.analyzeAndGenerate": "נתח וצור",
            "generator.analyzing": "מנתח תמונה...",
            "generator.helpText": "העלה תמונת ייחוס ואנחנו ניצור דמות על בסיסה"
        }
    };

    const t = (key) => {
        return translations[currentLanguage]?.[key] || translations.english[key] || key;
    };

    const generateImageFromDescription = async () => {
        if (!character.appearance || !character.name) {
            setError(t("generator.missingInfo"));
            return;
        }

        setIsGenerating(true);
        setError("");
        try {
            const prompt = `A portrait of ${character.name}. Appearance: ${character.appearance}. Gender: ${character.gender}. Age: ${character.age}. Style: ${character.art_style}, character portrait, high quality.`;
            const result = await GenerateImage({ prompt });
            
            if (result && result.url) {
                onImageGenerated(result.url);
                toast({ 
                    title: currentLanguage === "hebrew" ? "התמונה נוצרה!" : "Image Generated!",
                    description: currentLanguage === "hebrew" ? "תמונת הדמות החדשה מוכנה." : "The new character image is ready."
                });
            } else {
                throw new Error("Image generation failed to return a URL.");
            }
        } catch (error) {
            console.error("Failed to generate image:", error);
            setError(t("generator.generationFailed"));
            toast({
                variant: "destructive",
                title: t("generator.generationFailed"),
                description: t("generator.tryAgain")
            });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleFileUpload = async (file) => {
        if (!file) return;

        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            setError("Please upload a JPG, PNG, or WebP image.");
            return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            setError("Image must be smaller than 10MB.");
            return;
        }

        setIsUploading(true);
        setError("");

        try {
            // Upload the file
            const uploadResult = await UploadFile({ file });
            
            if (!uploadResult?.file_url) {
                throw new Error("Upload failed to return a URL");
            }

            // If we're on the upload tab, just use the uploaded image directly
            if (activeTab === "upload") {
                onImageGenerated(uploadResult.file_url);
                toast({
                    title: currentLanguage === "hebrew" ? "התמונה הועלתה!" : "Image Uploaded!",
                    description: currentLanguage === "hebrew" ? "התמונה הועלתה בהצלחה." : "The image has been uploaded successfully."
                });
            } else {
                // If we're on the generate tab, analyze the image and generate a new character based on it
                await generateFromUploadedImage(uploadResult.file_url);
            }

        } catch (error) {
            console.error("Upload error:", error);
            setError(t("generator.uploadFailed"));
            toast({
                variant: "destructive",
                title: t("generator.uploadFailed"),
                description: t("generator.tryAgain")
            });
        } finally {
            setIsUploading(false);
        }
    };

    const generateFromUploadedImage = async (imageUrl) => {
        try {
            setIsGenerating(true);
            
            // Use LLM to analyze the uploaded image and generate a character description
            const analysisResult = await InvokeLLM({
                prompt: `Analyze this image and create a character description for a children's story. Describe the character's appearance in detail, focusing on distinctive features, clothing, and style. Then generate a new character image in ${character.art_style} style based on this description.`,
                file_urls: [imageUrl],
                response_json_schema: {
                    type: "object",
                    properties: {
                        appearance_description: { type: "string" },
                        character_prompt: { type: "string" }
                    }
                }
            });

            if (analysisResult?.character_prompt) {
                // Generate new image based on the analysis
                const generationResult = await GenerateImage({ 
                    prompt: `${analysisResult.character_prompt}. Style: ${character.art_style}, character portrait, high quality.`
                });
                
                if (generationResult?.url) {
                    onImageGenerated(generationResult.url);
                    toast({
                        title: currentLanguage === "hebrew" ? "דמות נוצרה מהתמונה!" : "Character Generated from Image!",
                        description: currentLanguage === "hebrew" ? "דמות חדשה נוצרה על בסיס התמונה שהעלת." : "A new character has been created based on your uploaded image."
                    });
                }
            }
        } catch (error) {
            console.error("Failed to generate from uploaded image:", error);
            setError(t("generator.generationFailed"));
        } finally {
            setIsGenerating(false);
        }
    };

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFileUpload(e.target.files[0]);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="space-y-4" dir={isRTL ? "rtl" : "ltr"}>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="generate" className="flex items-center gap-2">
                        <Wand2 className="h-4 w-4" />
                        {t("generator.generate")}
                    </TabsTrigger>
                    <TabsTrigger value="upload" className="flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        {t("generator.upload")}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="generate" className="space-y-4">
                    <div className="space-y-3">
                        <Label className="text-sm font-medium">{t("generator.generateFromDescription")}</Label>
                        <Button 
                            onClick={generateImageFromDescription} 
                            disabled={isGenerating || !character.appearance || !character.name}
                            className="w-full"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4 animate-spin`} />
                                    {t("generator.generating")}
                                </>
                            ) : (
                                <>
                                    <Wand2 className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4`} />
                                    {t("generator.generateButton")}
                                </>
                            )}
                        </Button>
                        
                        <div className="border-t pt-4">
                            <Label className="text-sm font-medium">{t("generator.generateFromUpload")}</Label>
                            <p className="text-xs text-gray-500 mb-3">{t("generator.helpText")}</p>
                            
                            <div
                                className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center cursor-pointer hover:border-gray-300 transition-colors"
                                onClick={triggerFileInput}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={handleDrop}
                            >
                                <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-600 mb-1">{t("generator.dragDrop")}</p>
                                <p className="text-xs text-gray-500">{t("generator.supportedFormats")}</p>
                            </div>
                            
                            <input
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={handleFileSelect}
                            />
                            
                            {(isUploading || isGenerating) && (
                                <Button disabled className="w-full mt-3">
                                    <Loader2 className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4 animate-spin`} />
                                    {isUploading ? t("generator.uploading") : t("generator.analyzing")}
                                </Button>
                            )}
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="upload" className="space-y-4">
                    <div className="space-y-3">
                        <Label className="text-sm font-medium">{t("generator.uploadReference")}</Label>
                        
                        <div
                            className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center cursor-pointer hover:border-gray-300 transition-colors"
                            onClick={triggerFileInput}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleDrop}
                        >
                            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600 mb-1">{t("generator.dragDrop")}</p>
                            <p className="text-xs text-gray-500">{t("generator.supportedFormats")}</p>
                        </div>

                        {isUploading && (
                            <Button disabled className="w-full">
                                <Loader2 className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4 animate-spin`} />
                                {t("generator.uploading")}
                            </Button>
                        )}
                    </div>
                </TabsContent>
            </Tabs>

            {/* Preview Section */}
            <Card className="bg-gray-50 dark:bg-gray-800/50">
                <CardContent className="p-4 flex flex-col items-center justify-center">
                    <Avatar className="h-32 w-32 mb-4 border-4 border-white dark:border-gray-700 shadow-lg">
                        <AvatarImage src={character.primary_image_url} alt={character.name} />
                        <AvatarFallback className="text-4xl">
                            <User />
                        </AvatarFallback>
                    </Avatar>
                    <p className="text-xs text-gray-500 text-center">
                        {character.primary_image_url ? t("generator.currentImage") : t("generator.noImage")}
                    </p>
                </CardContent>
            </Card>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md flex items-start">
                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5 mr-2" />
                    <span className="text-sm">{error}</span>
                </div>
            )}
        </div>
    );
}