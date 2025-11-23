import React, { useState, useEffect } from 'react';
import { GenerateImage, InvokeLLM } from "@/integrations/Core";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Wand2, 
  RefreshCw, 
  User, 
  Users, 
  Palette, 
  BookOpen, 
  Save,
  Download,
  Sparkles,
  ArrowRight,
  ArrowLeft
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import ColorPicker from "../ui/colorPicker";

export default function CharacterDesigner({ bookData, onSaveCharacter, currentLanguage = "english" }) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("character-info");
  const [characterImage, setCharacterImage] = useState(null);
  const [characterVariations, setCharacterVariations] = useState([]);
  const [selectedVariation, setSelectedVariation] = useState(0);
  
  const [character, setCharacter] = useState({
    name: bookData?.child_name || "",
    age: bookData?.child_age || 5,
    gender: bookData?.child_gender || "neutral",
    personality: "",
    appearance: {
      hairColor: "#8B4513", // Default brown
      eyeColor: "#4B5320", // Default hazel
      skinTone: "#F5DEB3", // Default light
      height: "average", // short, average, tall
      bodyType: "average", // slim, average, plump
      clothingStyle: "casual", // casual, formal, fantasy, adventurous
      distinctiveFeatures: ""
    },
    backstory: "",
    role: "protagonist"
  });
  
  // Translation dictionaries
  const translations = {
    english: {
      "character.title": "AI Character Designer",
      "character.subtitle": "Create and visualize characters for your story",
      "character.tabs.info": "Character Info",
      "character.tabs.appearance": "Appearance",
      "character.tabs.visualization": "Visualization",
      "character.name": "Character Name",
      "character.name.placeholder": "Enter character name",
      "character.age": "Age",
      "character.age.years": "years old",
      "character.gender": "Gender",
      "character.gender.boy": "Boy",
      "character.gender.girl": "Girl",
      "character.gender.neutral": "Gender Neutral",
      "character.personality": "Personality",
      "character.personality.placeholder": "Describe the character's personality, traits, and behaviors",
      "character.role": "Role in Story",
      "character.role.protagonist": "Protagonist (Main Character)",
      "character.role.antagonist": "Antagonist",
      "character.role.supporting": "Supporting Character",
      "character.role.mentor": "Mentor",
      "character.role.sidekick": "Sidekick",
      "character.backstory": "Backstory (Optional)",
      "character.backstory.placeholder": "Provide some background for this character",
      "character.appearance.hairColor": "Hair Color",
      "character.appearance.eyeColor": "Eye Color",
      "character.appearance.skinTone": "Skin Tone",
      "character.appearance.height": "Height",
      "character.appearance.height.short": "Short",
      "character.appearance.height.average": "Average",
      "character.appearance.height.tall": "Tall",
      "character.appearance.bodyType": "Body Type",
      "character.appearance.bodyType.slim": "Slim",
      "character.appearance.bodyType.average": "Average",
      "character.appearance.bodyType.plump": "Plump",
      "character.appearance.clothing": "Clothing Style",
      "character.appearance.clothing.casual": "Casual",
      "character.appearance.clothing.formal": "Formal",
      "character.appearance.clothing.fantasy": "Fantasy",
      "character.appearance.clothing.adventurous": "Adventurous",
      "character.appearance.distinctive": "Distinctive Features",
      "character.appearance.distinctive.placeholder": "Glasses, freckles, birthmark, etc.",
      "character.visualization.generate": "Generate Character Image",
      "character.visualization.generating": "Generating...",
      "character.visualization.regenerate": "Regenerate",
      "character.visualization.variations": "Generate Variations",
      "character.visualization.save": "Save This Character",
      "character.visualization.prompt": "AI Prompt",
      "character.visualization.prompt.edit": "Edit",
      "character.visualization.prompt.update": "Update",
      "character.visualization.prompt.cancel": "Cancel",
      "character.next": "Next Step",
      "character.back": "Back",
      "character.save": "Save Character",
      "character.toast.saved": "Character saved successfully!",
      "character.toast.error": "Error generating character image. Please try again.",
      "character.toast.tip": "Tip: Add more details for better results!"
    },
    hebrew: {
      "character.title": "מעצב דמויות בינה מלאכותית",
      "character.subtitle": "צור והמחש דמויות לסיפור שלך",
      "character.tabs.info": "פרטי הדמות",
      "character.tabs.appearance": "מראה",
      "character.tabs.visualization": "המחשה",
      "character.name": "שם הדמות",
      "character.name.placeholder": "הזן שם לדמות",
      "character.age": "גיל",
      "character.age.years": "שנים",
      "character.gender": "מגדר",
      "character.gender.boy": "בן",
      "character.gender.girl": "בת",
      "character.gender.neutral": "ניטרלי",
      "character.personality": "אישיות",
      "character.personality.placeholder": "תאר את אישיות הדמות, תכונות והתנהגויות",
      "character.role": "תפקיד בסיפור",
      "character.role.protagonist": "גיבור/ה ראשי/ת",
      "character.role.antagonist": "מתנגד/ת",
      "character.role.supporting": "דמות תומכת",
      "character.role.mentor": "מנטור/ית",
      "character.role.sidekick": "עוזר/ת",
      "character.backstory": "רקע (אופציונלי)",
      "character.backstory.placeholder": "ספק רקע כלשהו לדמות זו",
      "character.appearance.hairColor": "צבע שיער",
      "character.appearance.eyeColor": "צבע עיניים",
      "character.appearance.skinTone": "גוון עור",
      "character.appearance.height": "גובה",
      "character.appearance.height.short": "נמוך",
      "character.appearance.height.average": "ממוצע",
      "character.appearance.height.tall": "גבוה",
      "character.appearance.bodyType": "מבנה גוף",
      "character.appearance.bodyType.slim": "רזה",
      "character.appearance.bodyType.average": "ממוצע",
      "character.appearance.bodyType.plump": "מלא",
      "character.appearance.clothing": "סגנון לבוש",
      "character.appearance.clothing.casual": "יומיומי",
      "character.appearance.clothing.formal": "רשמי",
      "character.appearance.clothing.fantasy": "פנטזיה",
      "character.appearance.clothing.adventurous": "הרפתקני",
      "character.appearance.distinctive": "מאפיינים ייחודיים",
      "character.appearance.distinctive.placeholder": "משקפיים, נמשים, כתם לידה וכו'",
      "character.visualization.generate": "צור תמונת דמות",
      "character.visualization.generating": "מייצר...",
      "character.visualization.regenerate": "צור מחדש",
      "character.visualization.variations": "צור וריאציות",
      "character.visualization.save": "שמור דמות זו",
      "character.visualization.prompt": "פרומפט לבינה מלאכותית",
      "character.visualization.prompt.edit": "ערוך",
      "character.visualization.prompt.update": "עדכן",
      "character.visualization.prompt.cancel": "בטל",
      "character.next": "השלב הבא",
      "character.back": "חזור",
      "character.save": "שמור דמות",
      "character.toast.saved": "הדמות נשמרה בהצלחה!",
      "character.toast.error": "שגיאה ביצירת תמונת הדמות. אנא נסה שוב.",
      "character.toast.tip": "טיפ: הוסף יותר פרטים לתוצאות טובות יותר!"
    }
  };
  
  // Translation function
  const t = (key) => {
    return translations[currentLanguage]?.[key] || translations.english[key] || key;
  };
  
  // Is RTL
  const isRTL = currentLanguage === "hebrew" || currentLanguage === "yiddish";
  
  const [imagePrompt, setImagePrompt] = useState("");
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);
  
  useEffect(() => {
    // Populate with book data if available
    if (bookData) {
      setCharacter(prev => ({
        ...prev,
        name: bookData.child_name || prev.name,
        age: bookData.child_age || prev.age,
        gender: bookData.child_gender || prev.gender
      }));
    }
  }, [bookData]);
  
  const generateImagePrompt = async () => {
    try {
      const characterInfo = {
        name: character.name,
        age: character.age,
        gender: character.gender,
        personality: character.personality,
        appearance: {
          hairColor: character.appearance.hairColor,
          eyeColor: character.appearance.eyeColor,
          skinTone: character.appearance.skinTone,
          height: character.appearance.height,
          bodyType: character.appearance.bodyType,
          clothingStyle: character.appearance.clothingStyle,
          distinctiveFeatures: character.appearance.distinctiveFeatures
        },
        backstory: character.backstory,
        role: character.role
      };
      
      let languagePrompt = "in English";
      if (currentLanguage === "hebrew") {
        languagePrompt = "in Hebrew";
      } else if (currentLanguage === "yiddish") {
        languagePrompt = "in Yiddish";
      }
      
      const result = await InvokeLLM({
        prompt: `Create a detailed image generation prompt to visualize a character for a children's book ${languagePrompt}. The character has the following details:
        
        Name: ${characterInfo.name}
        Age: ${characterInfo.age}
        Gender: ${characterInfo.gender}
        Personality: ${characterInfo.personality || "Friendly and curious"}
        Role: ${characterInfo.role}
        
        Appearance:
        - Hair color: ${characterInfo.appearance.hairColor}
        - Eye color: ${characterInfo.appearance.eyeColor}
        - Skin tone: ${characterInfo.appearance.skinTone}
        - Height: ${characterInfo.appearance.height}
        - Body type: ${characterInfo.appearance.bodyType}
        - Clothing style: ${characterInfo.appearance.clothingStyle}
        - Distinctive features: ${characterInfo.appearance.distinctiveFeatures || "None"}
        
        Background: ${characterInfo.backstory || "No specific background"}
        
        Create a prompt that:
        1. Is detailed but concise (150-200 words max)
        2. Uses specific details about physical appearance
        3. Captures the character's personality essence
        4. Uses child-friendly language
        5. Designed to create an appealing illustration for a children's story
        6. Specifies that this is a cartoon or illustration style, not photorealistic
        7. Uses art style: ${bookData?.art_style || "Disney-like animation"}
        
        Return only the prompt text with no additional commentary.`,
        response_json_schema: {
          type: "object",
          properties: {
            prompt: { type: "string" }
          }
        }
      });
      
      return result.prompt;
    } catch (error) {
      console.error("Error generating prompt:", error);
      toast({
        variant: "destructive",
        title: t("character.toast.error"),
        description: error.message
      });
      return null;
    }
  };
  
  const generateCharacterImage = async () => {
    try {
      setIsGenerating(true);
      
      // First, generate an optimized prompt
      const prompt = await generateImagePrompt();
      setImagePrompt(prompt);
      
      if (!prompt) {
        throw new Error("Failed to generate prompt");
      }
      
      // Then, use the prompt to generate the image
      const result = await GenerateImage({
        prompt: prompt
      });
      
      setCharacterImage(result.url);
      setCharacterVariations([]);
      setSelectedVariation(0);
      
    } catch (error) {
      console.error("Error generating character image:", error);
      toast({
        variant: "destructive",
        title: t("character.toast.error"),
        description: error.message
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const generateVariations = async () => {
    try {
      setIsGenerating(true);
      
      const variations = [];
      // Generate 4 variations
      for (let i = 0; i < 4; i++) {
        const result = await GenerateImage({
          prompt: imagePrompt
        });
        variations.push(result.url);
      }
      
      setCharacterVariations(variations);
      
    } catch (error) {
      console.error("Error generating variations:", error);
      toast({
        variant: "destructive",
        title: t("character.toast.error"),
        description: error.message
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleUpdatePrompt = async () => {
    try {
      setIsGenerating(true);
      
      // Use the edited prompt to generate a new image
      const result = await GenerateImage({
        prompt: imagePrompt
      });
      
      setCharacterImage(result.url);
      setCharacterVariations([]);
      setSelectedVariation(0);
      setIsEditingPrompt(false);
      
    } catch (error) {
      console.error("Error updating character image:", error);
      toast({
        variant: "destructive",
        title: t("character.toast.error"),
        description: error.message
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleSaveCharacter = () => {
    // Save the character
    const selectedImage = characterVariations.length > 0 && selectedVariation >= 0 
      ? characterVariations[selectedVariation] 
      : characterImage;
    
    onSaveCharacter({
      ...character,
      image: selectedImage,
      imagePrompt: imagePrompt
    });
    
    toast({
      title: t("character.toast.saved"),
      className: "bg-green-100 text-green-900 dark:bg-green-900/50 dark:text-green-100"
    });
  };
  
  const updateCharacter = (field, value) => {
    if (field.includes('.')) {
      // Handle nested properties
      const [parent, child] = field.split('.');
      setCharacter(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      // Handle top-level properties
      setCharacter(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };
  
  return (
    <Card className="w-full" dir={isRTL ? "rtl" : "ltr"}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Wand2 className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'} text-purple-500`} />
          {t("character.title")}
        </CardTitle>
        <CardDescription>
          {t("character.subtitle")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="character-info">
              <User className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t("character.tabs.info")}
            </TabsTrigger>
            <TabsTrigger value="character-appearance">
              <Palette className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t("character.tabs.appearance")}
            </TabsTrigger>
            <TabsTrigger value="character-visualization">
              <BookOpen className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t("character.tabs.visualization")}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="character-info" className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="character-name">{t("character.name")}</Label>
              <Input
                id="character-name"
                value={character.name}
                onChange={(e) => updateCharacter('name', e.target.value)}
                placeholder={t("character.name.placeholder")}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="character-age">{t("character.age")}</Label>
              <div className="flex items-center gap-4">
                <Slider
                  id="character-age"
                  min={1}
                  max={15}
                  step={1}
                  value={[character.age]}
                  onValueChange={(value) => updateCharacter('age', value[0])}
                  className="flex-1"
                />
                <span className="w-16 text-center font-medium">
                  {character.age} {t("character.age.years")}
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="character-gender">{t("character.gender")}</Label>
              <Select
                value={character.gender}
                onValueChange={(value) => updateCharacter('gender', value)}
              >
                <SelectTrigger id="character-gender">
                  <SelectValue placeholder={t("character.gender")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="boy">{t("character.gender.boy")}</SelectItem>
                  <SelectItem value="girl">{t("character.gender.girl")}</SelectItem>
                  <SelectItem value="neutral">{t("character.gender.neutral")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="character-personality">{t("character.personality")}</Label>
              <Textarea
                id="character-personality"
                value={character.personality}
                onChange={(e) => updateCharacter('personality', e.target.value)}
                placeholder={t("character.personality.placeholder")}
                className="min-h-[100px]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="character-role">{t("character.role")}</Label>
              <Select
                value={character.role}
                onValueChange={(value) => updateCharacter('role', value)}
              >
                <SelectTrigger id="character-role">
                  <SelectValue placeholder={t("character.role")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="protagonist">{t("character.role.protagonist")}</SelectItem>
                  <SelectItem value="antagonist">{t("character.role.antagonist")}</SelectItem>
                  <SelectItem value="supporting">{t("character.role.supporting")}</SelectItem>
                  <SelectItem value="mentor">{t("character.role.mentor")}</SelectItem>
                  <SelectItem value="sidekick">{t("character.role.sidekick")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="character-backstory">{t("character.backstory")}</Label>
              <Textarea
                id="character-backstory"
                value={character.backstory}
                onChange={(e) => updateCharacter('backstory', e.target.value)}
                placeholder={t("character.backstory.placeholder")}
                className="min-h-[100px]"
              />
            </div>
            
            <div className="flex justify-end mt-4">
              <Button onClick={() => setActiveTab("character-appearance")}>
                {t("character.next")} 
                {isRTL ? <ArrowLeft className="ml-2 h-4 w-4" /> : <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="character-appearance" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hair-color">{t("character.appearance.hairColor")}</Label>
                <ColorPicker
                  id="hair-color"
                  value={character.appearance.hairColor}
                  onChange={(value) => updateCharacter('appearance.hairColor', value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="eye-color">{t("character.appearance.eyeColor")}</Label>
                <ColorPicker
                  id="eye-color"
                  value={character.appearance.eyeColor}
                  onChange={(value) => updateCharacter('appearance.eyeColor', value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="skin-tone">{t("character.appearance.skinTone")}</Label>
                <ColorPicker
                  id="skin-tone"
                  value={character.appearance.skinTone}
                  onChange={(value) => updateCharacter('appearance.skinTone', value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="height">{t("character.appearance.height")}</Label>
                <Select
                  value={character.appearance.height}
                  onValueChange={(value) => updateCharacter('appearance.height', value)}
                >
                  <SelectTrigger id="height">
                    <SelectValue placeholder={t("character.appearance.height")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">{t("character.appearance.height.short")}</SelectItem>
                    <SelectItem value="average">{t("character.appearance.height.average")}</SelectItem>
                    <SelectItem value="tall">{t("character.appearance.height.tall")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="body-type">{t("character.appearance.bodyType")}</Label>
                <Select
                  value={character.appearance.bodyType}
                  onValueChange={(value) => updateCharacter('appearance.bodyType', value)}
                >
                  <SelectTrigger id="body-type">
                    <SelectValue placeholder={t("character.appearance.bodyType")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="slim">{t("character.appearance.bodyType.slim")}</SelectItem>
                    <SelectItem value="average">{t("character.appearance.bodyType.average")}</SelectItem>
                    <SelectItem value="plump">{t("character.appearance.bodyType.plump")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="clothing-style">{t("character.appearance.clothing")}</Label>
                <Select
                  value={character.appearance.clothingStyle}
                  onValueChange={(value) => updateCharacter('appearance.clothingStyle', value)}
                >
                  <SelectTrigger id="clothing-style">
                    <SelectValue placeholder={t("character.appearance.clothing")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="casual">{t("character.appearance.clothing.casual")}</SelectItem>
                    <SelectItem value="formal">{t("character.appearance.clothing.formal")}</SelectItem>
                    <SelectItem value="fantasy">{t("character.appearance.clothing.fantasy")}</SelectItem>
                    <SelectItem value="adventurous">{t("character.appearance.clothing.adventurous")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="distinctive-features">{t("character.appearance.distinctive")}</Label>
              <Input
                id="distinctive-features"
                value={character.appearance.distinctiveFeatures}
                onChange={(e) => updateCharacter('appearance.distinctiveFeatures', e.target.value)}
                placeholder={t("character.appearance.distinctive.placeholder")}
              />
            </div>
            
            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={() => setActiveTab("character-info")}>
                {isRTL ? <ArrowRight className="mr-2 h-4 w-4" /> : <ArrowLeft className="mr-2 h-4 w-4" />}
                {t("character.back")}
              </Button>
              <Button onClick={() => setActiveTab("character-visualization")}>
                {t("character.next")}
                {isRTL ? <ArrowLeft className="ml-2 h-4 w-4" /> : <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="character-visualization" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {imagePrompt && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-md mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium text-sm text-slate-900 dark:text-slate-100">
                        {t("character.visualization.prompt")}
                      </h4>
                      {isEditingPrompt ? (
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setIsEditingPrompt(false)}
                          >
                            {t("character.visualization.prompt.cancel")}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={handleUpdatePrompt}
                          >
                            {t("character.visualization.prompt.update")}
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setIsEditingPrompt(true)}
                        >
                          {t("character.visualization.prompt.edit")}
                        </Button>
                      )}
                    </div>
                    
                    {isEditingPrompt ? (
                      <Textarea
                        value={imagePrompt}
                        onChange={(e) => setImagePrompt(e.target.value)}
                        className="min-h-[200px] text-xs"
                      />
                    ) : (
                      <div className="text-xs text-slate-700 dark:text-slate-300 max-h-[200px] overflow-y-auto">
                        {imagePrompt}
                      </div>
                    )}
                  </div>
                )}
                
                <Button 
                  onClick={generateCharacterImage} 
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      {t("character.visualization.generating")}
                    </>
                  ) : characterImage ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      {t("character.visualization.regenerate")}
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-2 h-4 w-4" />
                      {t("character.visualization.generate")}
                    </>
                  )}
                </Button>
                
                {characterImage && !isGenerating && (
                  <>
                    <Button 
                      variant="outline" 
                      onClick={generateVariations}
                      disabled={isGenerating || characterVariations.length > 0}
                      className="w-full"
                    >
                      <Users className="mr-2 h-4 w-4" />
                      {t("character.visualization.variations")}
                    </Button>
                    
                    <Button 
                      onClick={handleSaveCharacter}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {t("character.visualization.save")}
                    </Button>
                  </>
                )}
              </div>
              
              <div>
                {isGenerating ? (
                  <div className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-md flex items-center justify-center">
                    <div className="flex flex-col items-center">
                      <RefreshCw className="h-8 w-8 animate-spin text-purple-500" />
                      <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                        {t("character.visualization.generating")}
                      </p>
                    </div>
                  </div>
                ) : characterImage ? (
                  <div className="space-y-4">
                    <div className="relative aspect-square bg-slate-100 dark:bg-slate-800 rounded-md overflow-hidden">
                      <img 
                        src={characterVariations.length > 0 && selectedVariation >= 0 
                          ? characterVariations[selectedVariation] 
                          : characterImage} 
                        alt={character.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {characterVariations.length > 0 && (
                      <div className="grid grid-cols-4 gap-2">
                        {characterVariations.map((variation, index) => (
                          <div 
                            key={index} 
                            className={`aspect-square cursor-pointer rounded-md overflow-hidden border-2 ${
                              selectedVariation === index 
                                ? 'border-purple-500 dark:border-purple-400' 
                                : 'border-transparent'
                            }`}
                            onClick={() => setSelectedVariation(index)}
                          >
                            <img 
                              src={variation} 
                              alt={`Variation ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-md flex items-center justify-center p-6">
                    <div className="text-center">
                      <User className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                      <p className="text-slate-500 dark:text-slate-400">
                        {character.name || t("character.name.placeholder")}
                      </p>
                      <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">
                        {t("character.toast.tip")}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={() => setActiveTab("character-appearance")}>
                {isRTL ? <ArrowRight className="mr-2 h-4 w-4" /> : <ArrowLeft className="mr-2 h-4 w-4" />}
                {t("character.back")}
              </Button>
              <Button 
                onClick={handleSaveCharacter}
                disabled={!characterImage}
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className="mr-2 h-4 w-4" />
                {t("character.save")}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}