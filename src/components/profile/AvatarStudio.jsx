
import React, { useState } from 'react';
import { GenerateImage } from "@/integrations/Core";
import { 
  Camera, 
  Wand2,
  Palette,
  RefreshCw,
  Sparkles,
  Download,
  Upload,
  User,
  Check,
  X,
  Image as ImageIcon,
  BookOpen,
  Trophy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AvatarStudio({ currentAvatar, onAvatarSelected, onClose, currentLanguage = "english" }) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar);
  const [activeTab, setActiveTab] = useState("presets");
  const [aiGenerationPrompt, setAiGenerationPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [generationStyle, setGenerationStyle] = useState("cartoon");
  const [characterType, setCharacterType] = useState("human");

  const translations = {
    english: {
      "avatar.title": "Avatar Studio",
      "avatar.presets": "Preset Avatars",
      "avatar.ai": "AI Generation",
      "avatar.characters": "Story Characters",
      "avatar.generate": "Generate Avatar",
      "avatar.generating": "Generating...",
      "avatar.style": "Style",
      "avatar.type": "Character Type",
      "avatar.prompt": "Description",
      "avatar.promptPlaceholder": "Describe your ideal avatar...",
      "avatar.save": "Save Avatar",
      "avatar.cancel": "Cancel",
      "avatar.styles.cartoon": "Cartoon",
      "avatar.styles.anime": "Anime",
      "avatar.styles.pixel": "Pixel Art",
      "avatar.styles.realistic": "Realistic",
      "avatar.type.human": "Human",
      "avatar.type.animal": "Animal",
      "avatar.type.fantasy": "Fantasy",
      "avatar.preview": "Preview",
      "avatar.upload": "Upload Image",
      "avatar.uploadDescription": "Upload your own avatar image",
      "avatar.drag": "Drag and drop an image here",
      "avatar.or": "or",
      "avatar.browse": "Browse files",
      "avatar.rewards": "Reward Avatars",
      "avatar.rewardsDescription": "Avatars you've earned through achievements",
      "avatar.illustrations": "Your Illustrations",
      "avatar.illustrationsDescription": "Use your book illustrations as avatar"
    },
    hebrew: {
      "avatar.title": "סטודיו אווטאר",
      "avatar.presets": "אווטארים מוכנים",
      "avatar.ai": "יצירה באמצעות AI",
      "avatar.characters": "דמויות מהסיפורים",
      "avatar.generate": "צור אווטאר",
      "avatar.generating": "יוצר...",
      "avatar.style": "סגנון",
      "avatar.type": "סוג דמות",
      "avatar.prompt": "תיאור",
      "avatar.promptPlaceholder": "תאר את האווטאר הרצוי...",
      "avatar.save": "שמור אווטאר",
      "avatar.cancel": "ביטול",
      "avatar.styles.cartoon": "מצויר",
      "avatar.styles.anime": "אנימה",
      "avatar.styles.pixel": "פיקסל ארט",
      "avatar.styles.realistic": "ריאליסטי",
      "avatar.type.human": "אנושי",
      "avatar.type.animal": "חיה",
      "avatar.type.fantasy": "פנטזיה",
      "avatar.preview": "תצוגה מקדימה",
      "avatar.upload": "העלאת תמונה",
      "avatar.uploadDescription": "העלה תמונת אווטאר משלך",
      "avatar.drag": "גרור ושחרר תמונה כאן",
      "avatar.or": "או",
      "avatar.browse": "בחר קובץ",
      "avatar.rewards": "אווטארים שהושגו",
      "avatar.rewardsDescription": "אווטארים שהרווחת דרך הישגים",
      "avatar.illustrations": "האיורים שלך",
      "avatar.illustrationsDescription": "השתמש באיורי הספרים שלך כאווטאר"
    }
  };

  const t = (key) => translations[currentLanguage]?.[key] || translations.english[key];
  const isRTL = currentLanguage === "hebrew";

  const generateAIAvatar = async () => {
    setIsGenerating(true);
    try {
      const stylePrompts = {
        cartoon: "cute cartoon style, child-friendly, colorful",
        anime: "anime style, child-friendly, kawaii",
        pixel: "pixel art style, retro gaming, 16-bit",
        realistic: "realistic digital art, child-appropriate, friendly"
      };

      const typePrompts = {
        human: "portrait of a person",
        animal: "friendly animal character",
        fantasy: "magical fantasy character"
      };

      const prompt = `Create a ${stylePrompts[generationStyle]} avatar showing a ${typePrompts[characterType]}. ${aiGenerationPrompt}`;

      const result = await GenerateImage({
        prompt: prompt
      });
      
      if (result?.url) {
        setSelectedAvatar(result.url);
      }
    } catch (error) {
      console.error("Error generating avatar:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    
    try {
      setIsLoading(true);
      const { UploadFile } = await import("@/integrations/Core");
      const result = await UploadFile({ file });
      
      if (result?.file_url) {
        setSelectedAvatar(result.file_url);
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFileUpload(file);
    }
  };

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <Tabs defaultValue="presets" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 mb-4">
          <TabsTrigger value="presets">{t("avatar.presets")}</TabsTrigger>
          <TabsTrigger value="upload">{t("avatar.upload")}</TabsTrigger>
          <TabsTrigger value="rewards">{t("avatar.rewards")}</TabsTrigger>
          <TabsTrigger value="illustrations">{t("avatar.illustrations")}</TabsTrigger>
          <TabsTrigger value="ai">{t("avatar.ai")}</TabsTrigger>
        </TabsList>

        {/* Preview Section - Always Visible */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <Avatar className="h-32 w-32 border-4 border-purple-100 dark:border-purple-900/50 shadow-lg">
              {selectedAvatar ? (
                <AvatarImage src={selectedAvatar} alt="Selected avatar" />
              ) : (
                <AvatarFallback>
                  <User className="h-12 w-12 text-gray-400" />
                </AvatarFallback>
              )}
            </Avatar>
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 px-3 py-1 rounded-full text-sm font-medium text-gray-600 dark:text-gray-300 shadow-sm border border-gray-100 dark:border-gray-700">
              {t("avatar.preview")}
            </span>
          </div>
        </div>

        <TabsContent value="upload" className="space-y-4">
          <div
            className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <Upload className="h-10 w-10 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300 mb-2">{t("avatar.drag")}</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{t("avatar.or")}</p>
            <Input
              type="file"
              accept="image/*"
              className="hidden"
              id="avatar-upload"
              onChange={(e) => handleFileUpload(e.target.files[0])}
            />
            <label htmlFor="avatar-upload">
              <Button as="span">
                {t("avatar.browse")}
              </Button>
            </label>
          </div>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {/* Here you would map through earned avatar rewards */}
            <div className="text-center p-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
              <Trophy className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t("avatar.rewardsDescription")}
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="illustrations" className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {/* Here you would map through user's book illustrations */}
            <div className="text-center p-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
              <Palette className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t("avatar.illustrationsDescription")}
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="ai" className="space-y-4">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("avatar.style")}</Label>
                <Select value={generationStyle} onValueChange={setGenerationStyle}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cartoon">{t("avatar.styles.cartoon")}</SelectItem>
                    <SelectItem value="anime">{t("avatar.styles.anime")}</SelectItem>
                    <SelectItem value="pixel">{t("avatar.styles.pixel")}</SelectItem>
                    <SelectItem value="realistic">{t("avatar.styles.realistic")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t("avatar.type")}</Label>
                <Select value={characterType} onValueChange={setCharacterType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="human">{t("avatar.type.human")}</SelectItem>
                    <SelectItem value="animal">{t("avatar.type.animal")}</SelectItem>
                    <SelectItem value="fantasy">{t("avatar.type.fantasy")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t("avatar.prompt")}</Label>
              <Input
                placeholder={t("avatar.promptPlaceholder")}
                value={aiGenerationPrompt}
                onChange={(e) => setAiGenerationPrompt(e.target.value)}
              />
            </div>

            <Button 
              className="w-full"
              onClick={generateAIAvatar}
              disabled={isGenerating || !aiGenerationPrompt}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  {t("avatar.generating")}
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  {t("avatar.generate")}
                </>
              )}
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button variant="outline" onClick={onClose}>
          <X className="h-4 w-4 mr-2" />
          {t("avatar.cancel")}
        </Button>
        <Button 
          onClick={() => onAvatarSelected(selectedAvatar)}
          disabled={isLoading || !selectedAvatar}
        >
          {isLoading ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Check className="h-4 w-4 mr-2" />
          )}
          {t("avatar.save")}
        </Button>
      </div>
    </div>
  );
}
