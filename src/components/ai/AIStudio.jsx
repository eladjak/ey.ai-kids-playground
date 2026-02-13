
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Sparkles,
  Image,
  Video,
  Music,
  Zap,
  Crown,
  Lock,
  CheckCircle,
  Settings,
  Info,
  Wand2,
  Rocket,
  Type,
  Plus,
  RotateCw // New import for spinner icon
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Input } from '@/components/ui/input'; // New import for Input component
import ModelSelector from './ModelSelector';
import TextOverlay from './TextOverlay'; // Import the new component
import { GenerateImage, UploadFile } from '@/integrations/Core'; // New imports for integrations

export default function AIStudio({
  currentModel,
  onModelChange,
  userTier = "free",
  credits = { used: 0, total: 50 },
  currentLanguage = "english"
}) {
  const [selectedCategory, setSelectedCategory] = useState("image");
  const [mode, setMode] = useState('simple');
  const [selectedVoice, setSelectedVoice] = useState('adam');
  const [generatedImageUrl, setGeneratedImageUrl] = useState(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false); // New state for loading
  const [prompt, setPrompt] = useState(''); // New state for prompt input

  const translations = {
    english: {
      "studio.title": "AI Studio",
      "studio.subtitle": "Choose your AI models and settings",
      "studio.credits": "Credits",
      "studio.upgrade": "Upgrade Plan",
      "studio.mode.simple": "Simple Mode",
      "studio.mode.advanced": "Advanced Mode",
      "studio.simple.title": "What do you want to create?",
      "studio.simple.quality.title": "🎨 Best Quality",
      "studio.simple.quality.desc": "For stunning, artistic illustrations. (Best for final images)",
      "studio.simple.text.title": "🔤 Text in Image",
      "studio.simple.text.desc": "Perfect for including names or words in Hebrew/English.",
      "studio.simple.fast.title": "⚡️ Fast & Fun",
      "studio.simple.fast.desc": "Great for quick ideas and drafts. (Most credit-efficient)",
      "studio.categories.image": "Image Generation",
      "studio.categories.video": "Video Generation",
      "studio.categories.audio": "Audio Generation",
      "studio.audio.narration": "Narration",
      "studio.audio.music": "Music & SFX",
      "studio.audio.selectVoice": "Select Voice",
      "studio.audio.voiceCloning": "Voice Cloning (Pro)",
      "studio.audio.voiceCloningDesc": "Upload a sample and use your own voice!",
      "model.free": "Free",
      "model.creator": "Creator",
      "model.pro": "Pro",
      "model.premium": "Premium",
      "studio.prompt.label": "Describe the image you want to create",
      "studio.prompt.placeholder": "e.g., A young child playing in a garden with a brown dog...",
      "studio.button.generate": "Generate Image",
      "studio.button.generating": "Generating...",
      "studio.warning.noModel": "Please select an image model to start creating"
    },
    hebrew: {
      "studio.title": "סטודיו AI",
      "studio.subtitle": "בחר את מודלי ה-AI וההגדרות שלך",
      "studio.credits": "קרדיטים",
      "studio.upgrade": "שדרג חבילה",
      "studio.mode.simple": "מצב פשוט",
      "studio.mode.advanced": "מצב מתקדם",
      "studio.simple.title": "מה תרצו ליצור?",
      "studio.simple.quality.title": "🎨 האיכות הגבוהה ביותר",
      "studio.simple.quality.desc": "לאיורים אמנותיים מרהיבים. (מעולה לתמונות סופיות)",
      "studio.simple.text.title": "🔤 טקסט בתמונה",
      "studio.simple.text.desc": "מושלם להוספת שמות או מילים בעברית/אנגלית.",
      "studio.simple.fast.title": "⚡️ מהיר וכיפי",
      "studio.simple.fast.desc": "מעולה לרעיונות מהירים וטיוטות. (הכי חסכוני בקרדיטים)",
      "studio.categories.image": "יצירת תמונות",
      "studio.categories.video": "יצירת וידאו",
      "studio.categories.audio": "יצירת אודיו",
      "studio.audio.narration": "קריינות",
      "studio.audio.music": "מוזיקה ואפקטים",
      "studio.audio.selectVoice": "בחר קול",
      "studio.audio.voiceCloning": "שיבוט קולי (מקצועי)",
      "studio.audio.voiceCloningDesc": "העלה דגימה והשתמש בקול שלך!",
      "model.free": "חינם",
      "model.creator": "יוצר",
      "model.pro": "פרו",
      "model.premium": "פרימיום",
      "studio.prompt.label": "תאר את התמונה שתרצה ליצור",
      "studio.prompt.placeholder": "למשל: ילד קטן משחק בגינה עם כלב חום...",
      "studio.button.generate": "צור תמונה",
      "studio.button.generating": "יוצר...",
      "studio.warning.noModel": "אנא בחר מודל תמונה כדי להתחיל ליצור"
    }
  };

  const t = (key) => {
    return translations[currentLanguage]?.[key] || translations.english[key] || key;
  };

  const isRTL = currentLanguage === "hebrew";

  const recommendedModels = {
    quality: { id: 'midjourney' },
    text: { id: 'ideogram-basic' },
    fast: { id: 'sdxl' }
  };

  const SimpleModeCard = ({ icon, title, description, model, isSelected }) => (
    <Card
      className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${isSelected ? 'ring-2 ring-purple-500 shadow-xl' : ''}`}
      onClick={() => onModelChange(model)}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-lg">{icon} {title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
      </CardContent>
    </Card>
  );

  const voices = [
    { id: 'adam', name: 'Adam (Male, Calm)', tier: 'free' },
    { id: 'rachel', name: 'Rachel (Female, Expressive)', tier: 'free' },
    { id: 'david', name: 'David (Male, Deep)', tier: 'creator' },
    { id: 'sarah', name: 'Sarah (Female, Storyteller)', tier: 'creator' },
    { id: 'liam', name: 'Liam (Male, Professional)', tier: 'pro' }
  ];

  const canAccessVoice = (voice) => {
    const tierHierarchy = { free: 0, creator: 1, pro: 2, premium: 3 };
    const userTierLevel = tierHierarchy[userTier] || 0;
    const voiceTierLevel = tierHierarchy[voice.tier] || 0;
    return userTierLevel >= voiceTierLevel;
  }

  const handleImageGeneration = async () => {
    if (!prompt.trim() || !currentModel) return;

    try {
      setIsGenerating(true);

      // Use the actual GenerateImage integration
      const result = await GenerateImage({
        prompt: prompt
        // You might want to pass currentModel.id or other parameters here based on your GenerateImage API
        // For example: model_id: currentModel.id
      });

      setGeneratedImageUrl(result.url); // Assuming result has a 'url' property
      setShowOverlay(true);
    } catch (error) {
      alert("Failed to generate image. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveOverlay = async (data) => {
    try {
      // Upload the final image blob
      const uploadResult = await UploadFile({
        file: data.imageBlob // Assuming data.imageBlob is a File or Blob object
      });

      setShowOverlay(false);
      setGeneratedImageUrl(null);
      setPrompt(''); // Clear prompt after successful save

      // Show success message
      alert("Image with text saved successfully!");

    } catch (error) {
      alert("Failed to save image. Please try again.");
    }
  };

  const handleCancelOverlay = () => {
    setShowOverlay(false);
    setGeneratedImageUrl(null);
  };

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                {t("studio.title")}
              </CardTitle>
              <CardDescription>{t("studio.subtitle")}</CardDescription>
            </div>
            <div className="flex items-center gap-4">
               {/* Mode Switch */}
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Label htmlFor="mode-switch" className="text-sm font-medium">{t("studio.mode.simple")}</Label>
                <Switch
                  id="mode-switch"
                  checked={mode === 'advanced'}
                  onCheckedChange={(checked) => setMode(checked ? 'advanced' : 'simple')}
                />
                <Label htmlFor="mode-switch" className="text-sm font-medium">{t("studio.mode.advanced")}</Label>
              </div>

              {/* Credits and Tier Info */}
              <div className="text-right">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                    {userTier} Plan
                  </Badge>
                  {userTier !== "pro" && (
                    <Button variant="outline" size="sm">
                      <Crown className="h-4 w-4 mr-1 rtl:ml-1" />
                      {t("studio.upgrade")}
                    </Button>
                  )}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <span>{t("studio.credits")}: </span>
                  <span className="font-medium">
                    {credits.total - credits.used}/{credits.total}
                  </span>
                </div>
                <Progress
                  value={(credits.total - credits.used) / credits.total * 100}
                  className="w-32 h-2 mt-1"
                />
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="image" className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            {t("studio.categories.image")}
          </TabsTrigger>
          <TabsTrigger value="video" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            {t("studio.categories.video")}
          </TabsTrigger>
          <TabsTrigger value="audio" className="flex items-center gap-2">
            <Music className="h-4 w-4" />
            {t("studio.categories.audio")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="image" className="mt-6">
          {showOverlay && generatedImageUrl ? (
            <TextOverlay
              imageUrl={generatedImageUrl}
              onSave={handleSaveOverlay}
              onCancel={handleCancelOverlay}
              currentLanguage={currentLanguage}
            />
          ) : (
            <>
              {mode === 'simple' ? (
                <div className="space-y-4">
                   <h3 className="text-lg font-semibold text-center mb-4">{t("studio.simple.title")}</h3>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <SimpleModeCard
                        icon="🎨"
                        title={t("studio.simple.quality.title")}
                        description={t("studio.simple.quality.desc")}
                        model={recommendedModels.quality}
                        isSelected={currentModel?.id === recommendedModels.quality.id}
                      />
                      <SimpleModeCard
                        icon="🔤"
                        title={t("studio.simple.text.title")}
                        description={t("studio.simple.text.desc")}
                        model={recommendedModels.text}
                        isSelected={currentModel?.id === recommendedModels.text.id}
                      />
                       <SimpleModeCard
                        icon="⚡️"
                        title={t("studio.simple.fast.title")}
                        description={t("studio.simple.fast.desc")}
                        model={recommendedModels.fast}
                        isSelected={currentModel?.id === recommendedModels.fast.id}
                      />
                   </div>
                </div>
              ) : (
                <ModelSelector
                  category={selectedCategory}
                  selectedModel={currentModel}
                  onModelChange={onModelChange}
                  userTier={userTier}
                  credits={credits}
                  currentLanguage={currentLanguage}
                />
              )}

              {/* Prompt Input and Generate Button */}
              <div className="mt-6 space-y-4">
                <div>
                  <Label htmlFor="image-prompt" className="text-sm font-medium">
                    {t("studio.prompt.label")}
                  </Label>
                  <div className="mt-2 flex gap-2">
                    <Input
                      id="image-prompt"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder={t("studio.prompt.placeholder")}
                      className="flex-1"
                      dir={isRTL ? "rtl" : "ltr"}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !isGenerating) {
                          handleImageGeneration();
                        }
                      }}
                    />
                    <Button
                      onClick={handleImageGeneration}
                      disabled={!currentModel || !prompt.trim() || isGenerating}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      {isGenerating ? (
                        <>
                          <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                          {t("studio.button.generating")}
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          {t("studio.button.generate")}
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {!currentModel && (
                  <p className="text-sm text-amber-600 dark:text-amber-400">
                    {t("studio.warning.noModel")}
                  </p>
                )}
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="video" className="mt-6">
           <ModelSelector
              category="video"
              selectedModel={currentModel}
              onModelChange={onModelChange}
              userTier={userTier}
              credits={credits}
              currentLanguage={currentLanguage}
            />
        </TabsContent>

        <TabsContent value="audio" className="mt-6">
          <Tabs defaultValue="narration" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="narration">{t("studio.audio.narration")}</TabsTrigger>
              <TabsTrigger value="music">{t("studio.audio.music")}</TabsTrigger>
            </TabsList>
            <TabsContent value="narration" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t("studio.audio.selectVoice")}</CardTitle>
                  <CardDescription>Powered by ElevenLabs</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("studio.audio.selectVoice")} />
                    </SelectTrigger>
                    <SelectContent>
                      {voices.map(voice => (
                        <SelectItem key={voice.id} value={voice.id} disabled={!canAccessVoice(voice)}>
                          {voice.name} {!canAccessVoice(voice) && `(${t(`model.${voice.tier}`)})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Card className="bg-gray-50 dark:bg-gray-800/50">
                    <CardHeader>
                      <CardTitle className="text-base">{t("studio.audio.voiceCloning")}</CardTitle>
                      <CardDescription>{t("studio.audio.voiceCloningDesc")}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button disabled={userTier !== 'pro' && userTier !== 'premium'}>
                        <Plus className="mr-2 h-4 w-4" />
                        Upload Voice Sample
                      </Button>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="music" className="mt-4">
               <ModelSelector
                category="music"
                selectedModel={currentModel}
                onModelChange={onModelChange}
                userTier={userTier}
                credits={credits}
                currentLanguage={currentLanguage}
              />
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
}
