import React, { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  Image as LucideImage, 
  RefreshCcw, 
  Trash, 
  Download, 
  Loader2, 
  ThumbsUp, 
  ThumbsDown,
  Paintbrush,
  User,
  PanelRight,
  Palette,
  Save
} from "lucide-react";
import { GenerateImage } from "@/integrations/Core";

export default function ImageGenerator({
  bookId,
  characterData,
  pageContent,
  onImageGenerated,
  currentLanguage = "english",
  isRTL = false
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [activeTab, setActiveTab] = useState("prompt");
  const [formState, setFormState] = useState({
    basePrompt: "",
    style: "disney",
    characters: [],
    includeCharacters: true,
    includeSetting: true,
    includeEmotions: true,
    includeDetails: true,
    negativePrompt: "blurry, low quality, distorted faces, poor lighting, bad anatomy"
  });

  // Character and prompt history
  const [characterImages, setCharacterImages] = useState({});
  const [promptHistory, setPromptHistory] = useState([]);
  
  useEffect(() => {
    // When pageContent changes, suggest a prompt based on the content
    if (pageContent && pageContent.text) {
      suggestPromptFromText(pageContent.text);
    }
    
    // Load previously generated character images
    if (characterData && characterData.length > 0) {
      const characters = {};
      characterData.forEach(char => {
        if (char.image_url) {
          characters[char.name] = char.image_url;
        }
      });
      setCharacterImages(characters);
    }
  }, [pageContent, characterData]);
  
  const suggestPromptFromText = (text) => {
    // Extract key elements from the text to suggest a prompt
    // This is a simple implementation - a real one might use NLP
    const words = text.split(' ');
    const keywords = words.filter(word => word.length > 4).slice(0, 10);
    
    setFormState(prev => ({
      ...prev,
      basePrompt: `Illustration for a children's book: ${keywords.join(' ')}, ${formState.style} style`
    }));
  };
  
  // Translations
  const translations = {
    english: {
      title: "Book Illustration Generator",
      subtitle: "Create custom illustrations for your story",
      tabs: {
        prompt: "Prompt Editor",
        style: "Art Style",
        history: "History",
        settings: "Settings"
      },
      prompt: {
        title: "Describe Your Illustration",
        placeholder: "Describe what you want to see in your illustration...",
        generate: "Generate Illustration",
        generating: "Creating magic...",
        regenerate: "Try Again",
        save: "Save to Book",
        download: "Download",
        includeCharacters: "Include character descriptions",
        includeSetting: "Include setting details",
        includeEmotions: "Include emotional elements",
        includeDetails: "Add extra artistic details",
        negativePrompt: "Things to avoid",
        negativePlaceholder: "Elements to exclude from the image"
      },
      style: {
        title: "Choose Art Style",
        disney: "Disney",
        pixar: "Pixar",
        watercolor: "Watercolor",
        sketch: "Sketch",
        cartoon: "Cartoon",
        realistic: "Realistic",
        anime: "Anime",
        clay: "Clay Animation",
        popup: "Pop-up Book",
        minimalist: "Minimalist",
        vintage: "Vintage",
        cultural: "Cultural"
      },
      history: {
        title: "Recent Illustrations",
        empty: "No illustrations generated yet",
        use: "Use This"
      },
      settings: {
        title: "Advanced Settings",
        consistency: "Character Consistency",
        consistencyDescription: "Ensure characters look the same across illustrations",
        quality: "Image Quality",
        size: "Image Size",
        themes: "Theme Colors",
        export: "Export Settings"
      }
    },
    hebrew: {
      title: "מחולל איורים לספר",
      subtitle: "צור איורים מותאמים אישית לסיפור שלך",
      tabs: {
        prompt: "עורך בקשות",
        style: "סגנון אמנותי",
        history: "היסטוריה",
        settings: "הגדרות"
      },
      prompt: {
        title: "תאר את האיור שלך",
        placeholder: "תאר מה תרצה לראות באיור שלך...",
        generate: "צור איור",
        generating: "יוצר קסם...",
        regenerate: "נסה שוב",
        save: "שמור לספר",
        download: "הורד",
        includeCharacters: "כלול תיאורי דמויות",
        includeSetting: "כלול פרטי סביבה",
        includeEmotions: "כלול אלמנטים רגשיים",
        includeDetails: "הוסף פרטים אמנותיים נוספים",
        negativePrompt: "דברים להימנע מהם",
        negativePlaceholder: "אלמנטים שיש להוציא מהתמונה"
      },
      style: {
        title: "בחר סגנון אמנותי",
        disney: "דיסני",
        pixar: "פיקסאר",
        watercolor: "צבעי מים",
        sketch: "סקיצה",
        cartoon: "קריקטורה",
        realistic: "ריאליסטי",
        anime: "אנימה",
        clay: "הנפשת חימר",
        popup: "ספר פופ-אפ",
        minimalist: "מינימליסטי",
        vintage: "וינטג'",
        cultural: "תרבותי"
      },
      history: {
        title: "איורים אחרונים",
        empty: "טרם נוצרו איורים",
        use: "השתמש בזה"
      },
      settings: {
        title: "הגדרות מתקדמות",
        consistency: "עקביות דמויות",
        consistencyDescription: "וודא שהדמויות נראות זהות בכל האיורים",
        quality: "איכות תמונה",
        size: "גודל תמונה",
        themes: "צבעי נושא",
        export: "ייצא הגדרות"
      }
    }
  };
  
  const t = (path) => {
    const parts = path.split('.');
    let result = translations[currentLanguage] || translations.english;
    
    for (const part of parts) {
      result = result[part] || {};
    }
    
    return typeof result === 'string' ? result : path;
  };
  
  const generatePrompt = () => {
    let prompt = formState.basePrompt;
    
    // Add characters if enabled
    if (formState.includeCharacters && characterData?.length > 0) {
      const characterDescriptions = characterData
        .map(char => `${char.name}: ${char.description || 'a character'}`)
        .join(', ');
      prompt += `, with characters: ${characterDescriptions}`;
    }
    
    // Add setting if enabled and available
    if (formState.includeSetting && pageContent?.setting) {
      prompt += `, in setting: ${pageContent.setting}`;
    }
    
    // Add emotions if enabled
    if (formState.includeEmotions && pageContent?.emotion) {
      prompt += `, conveying emotions: ${pageContent.emotion}`;
    }
    
    // Add artistic details if enabled
    if (formState.includeDetails) {
      prompt += `, high quality, detailed illustration, children's book style, ${formState.style} art style`;
    }
    
    return prompt;
  };
  
  const handleGenerateImage = async () => {
    const finalPrompt = generatePrompt();
    
    try {
      setIsGenerating(true);
      const result = await GenerateImage({
        prompt: finalPrompt,
        // Any additional parameters like negative_prompt could be added here
      });
      
      if (result && result.url) {
        setGeneratedImage(result.url);
        
        // Add to prompt history
        setPromptHistory(prev => [
          { prompt: finalPrompt, imageUrl: result.url, timestamp: new Date().toISOString() },
          ...prev.slice(0, 9) // Keep only the 10 most recent
        ]);
      }
    } catch (error) {
      console.error("Error generating image:", error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleStyleChange = (style) => {
    setFormState(prev => ({ ...prev, style }));
  };
  
  const handleSaveImage = () => {
    if (generatedImage && onImageGenerated) {
      onImageGenerated(generatedImage);
    }
  };
  
  const renderStyleOptions = () => {
    const styles = [
      { id: "disney", icon: "🏰" },
      { id: "pixar", icon: "🧸" },
      { id: "watercolor", icon: "🎨" },
      { id: "sketch", icon: "✏️" },
      { id: "cartoon", icon: "📺" },
      { id: "realistic", icon: "🖼️" },
      { id: "anime", icon: "✨" },
      { id: "clay", icon: "🧩" },
      { id: "popup", icon: "📚" },
      { id: "minimalist", icon: "⬜" },
      { id: "vintage", icon: "🕰️" },
      { id: "cultural", icon: "🌍" },
    ];
    
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {styles.map((style) => (
          <div
            key={style.id}
            className={`border rounded-lg p-4 text-center cursor-pointer transition-all hover:shadow-md ${
              formState.style === style.id 
                ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-600" 
                : "border-gray-200 dark:border-gray-700"
            }`}
            onClick={() => handleStyleChange(style.id)}
          >
            <div className="text-3xl mb-2">{style.icon}</div>
            <div className="font-medium">{t(`style.${style.id}`)}</div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className="w-full shadow-md" dir={isRTL ? "rtl" : "ltr"}>
      <CardHeader>
        <CardTitle className="text-xl">{t('title')}</CardTitle>
        <p className="text-gray-500 dark:text-gray-400">{t('subtitle')}</p>
      </CardHeader>
      
      <CardContent className="p-6">
        <Tabs defaultValue="prompt" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="prompt">
              <Sparkles className="h-4 w-4 mr-2" />
              {t('tabs.prompt')}
            </TabsTrigger>
            <TabsTrigger value="style">
              <Palette className="h-4 w-4 mr-2" />
              {t('tabs.style')}
            </TabsTrigger>
            <TabsTrigger value="history">
              <RefreshCcw className="h-4 w-4 mr-2" />
              {t('tabs.history')}
            </TabsTrigger>
            <TabsTrigger value="settings">
              <PanelRight className="h-4 w-4 mr-2" />
              {t('tabs.settings')}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="prompt" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label>{t('prompt.title')}</Label>
                <Textarea 
                  value={formState.basePrompt}
                  onChange={(e) => setFormState(prev => ({ ...prev, basePrompt: e.target.value }))}
                  placeholder={t('prompt.placeholder')}
                  className="mt-1"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="includeCharacters"
                      checked={formState.includeCharacters}
                      onCheckedChange={(checked) => 
                        setFormState(prev => ({ ...prev, includeCharacters: !!checked }))
                      }
                    />
                    <Label htmlFor="includeCharacters">{t('prompt.includeCharacters')}</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="includeSetting"
                      checked={formState.includeSetting}
                      onCheckedChange={(checked) => 
                        setFormState(prev => ({ ...prev, includeSetting: !!checked }))
                      }
                    />
                    <Label htmlFor="includeSetting">{t('prompt.includeSetting')}</Label>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="includeEmotions"
                      checked={formState.includeEmotions}
                      onCheckedChange={(checked) => 
                        setFormState(prev => ({ ...prev, includeEmotions: !!checked }))
                      }
                    />
                    <Label htmlFor="includeEmotions">{t('prompt.includeEmotions')}</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="includeDetails"
                      checked={formState.includeDetails}
                      onCheckedChange={(checked) => 
                        setFormState(prev => ({ ...prev, includeDetails: !!checked }))
                      }
                    />
                    <Label htmlFor="includeDetails">{t('prompt.includeDetails')}</Label>
                  </div>
                </div>
              </div>
              
              <div>
                <Label>{t('prompt.negativePrompt')}</Label>
                <Input 
                  value={formState.negativePrompt}
                  onChange={(e) => setFormState(prev => ({ ...prev, negativePrompt: e.target.value }))}
                  placeholder={t('prompt.negativePlaceholder')}
                  className="mt-1"
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="style" className="space-y-4">
            {renderStyleOptions()}
          </TabsContent>
          
          <TabsContent value="history" className="space-y-4">
            {promptHistory.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {promptHistory.map((item, index) => (
                  <div key={index} className="border rounded-lg overflow-hidden">
                    <img 
                      src={item.imageUrl} 
                      alt={`Generated image ${index}`}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-3">
                      <p className="text-xs text-gray-500 line-clamp-2">{item.prompt}</p>
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        className="mt-2 w-full"
                        onClick={() => {
                          setGeneratedImage(item.imageUrl);
                          setActiveTab("prompt");
                        }}
                      >
                        {t('history.use')}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500">
                <LucideImage className="h-16 w-16 mb-4 opacity-20" />
                <p>{t('history.empty')}</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-6">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between">
                  <Label>{t('settings.consistency')}</Label>
                  <Badge variant="outline">{t('settings.consistencyDescription')}</Badge>
                </div>
                <Slider
                  defaultValue={[75]}
                  max={100}
                  step={1}
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label>{t('settings.quality')}</Label>
                <Select defaultValue="high">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="ultra">Ultra</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>{t('settings.size')}</Label>
                <Select defaultValue="square">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="square">Square (1:1)</SelectItem>
                    <SelectItem value="portrait">Portrait (3:4)</SelectItem>
                    <SelectItem value="landscape">Landscape (4:3)</SelectItem>
                    <SelectItem value="wide">Wide (16:9)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-6 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          {generatedImage ? (
            <img 
              src={generatedImage} 
              alt="Generated illustration" 
              className="w-full h-64 md:h-80 object-cover"
            />
          ) : (
            <div className="w-full h-64 md:h-80 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              {isGenerating ? (
                <Loader2 className="h-12 w-12 animate-spin text-gray-400" />
              ) : (
                <div className="text-center p-6">
                  <LucideImage className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500 dark:text-gray-400">
                    {formState.basePrompt 
                      ? "Click generate to create your illustration" 
                      : "Enter a description to generate an illustration"}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-wrap gap-2 justify-between">
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={handleGenerateImage}
            disabled={isGenerating || !formState.basePrompt}
            className={generatedImage ? "bg-gray-200 text-gray-800 hover:bg-gray-300" : "bg-purple-600 hover:bg-purple-700"}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('prompt.generating')}
              </>
            ) : generatedImage ? (
              <>
                <RefreshCcw className="mr-2 h-4 w-4" />
                {t('prompt.regenerate')}
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                {t('prompt.generate')}
              </>
            )}
          </Button>
          
          {generatedImage && (
            <>
              <Button 
                variant="outline"
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = generatedImage;
                  link.download = `illustration-${Date.now()}.png`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
              >
                <Download className="mr-2 h-4 w-4" />
                {t('prompt.download')}
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => setGeneratedImage(null)}
              >
                <Trash className="mr-2 h-4 w-4" />
              </Button>
            </>
          )}
        </div>
        
        {generatedImage && (
          <Button 
            onClick={handleSaveImage}
            className="bg-green-600 hover:bg-green-700"
          >
            <Save className="mr-2 h-4 w-4" />
            {t('prompt.save')}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}