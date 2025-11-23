import React, { useState, useEffect } from 'react';
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
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Sparkles, 
  Plus, 
  X, 
  Music, 
  Volume2, 
  Mic, 
  MousePointer, 
  Maximize, 
  Flower2, 
  CloudSun,
  Wand2,
  Shapes,
  MessageSquare
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function InteractiveElementsPanel({ 
  interactiveElements, 
  setInteractiveElements, 
  onAddElement,
  currentPageIndex 
}) {
  const { toast } = useToast();
  const [elementType, setElementType] = useState("clickable-audio");
  const [currentLanguage, setCurrentLanguage] = useState("english");
  const [isRTL, setIsRTL] = useState(false);
  const [elementConfig, setElementConfig] = useState({
    id: "",
    type: "clickable-audio",
    position: { x: 50, y: 50 },
    size: "medium",
    content: "",
    audioUrl: "",
    animation: "none",
    condition: "always",
    pageIndex: currentPageIndex
  });
  
  // Translation dictionaries
  const translations = {
    english: {
      "interactive.add-element": "Add Interactive Element",
      "interactive.add-element-description": "Add special elements to make your story interactive",
      "interactive.element-type": "Element Type",
      "interactive.elements.clickable-audio": "Sound",
      "interactive.elements.pop-up-text": "Pop-up Text",
      "interactive.elements.animation": "Animation",
      "interactive.elements.background-change": "Background Change",
      "interactive.elements.interactive-choice": "Choice",
      "interactive.elements.decorative": "Decoration",
      "interactive.elements.narration": "Narration",
      "interactive.clickable-text": "Clickable Text",
      "interactive.clickable-text-placeholder": "Enter text for the clickable element...",
      "interactive.audio-url": "Audio URL",
      "interactive.audio-url-placeholder": "https://example.com/sound.mp3",
      "interactive.audio-url-help": "Enter URL to an audio file or leave empty to use text-to-speech",
      "interactive.popup-trigger": "Popup Trigger Text",
      "interactive.popup-text": "Popup Content",
      "interactive.narration-text": "Narration Text",
      "interactive.auto-play": "Auto-play on page load",
      "interactive.add-to-page": "Add to Page",
      "interactive.added-elements": "Added Elements",
      "interactive.no-content": "No content specified"
    },
    hebrew: {
      "interactive.add-element": "הוסף אלמנט אינטראקטיבי",
      "interactive.add-element-description": "הוסף אלמנטים מיוחדים כדי להפוך את הסיפור שלך לאינטראקטיבי",
      "interactive.element-type": "סוג האלמנט",
      "interactive.elements.clickable-audio": "צליל",
      "interactive.elements.pop-up-text": "טקסט קופץ",
      "interactive.elements.animation": "אנימציה",
      "interactive.elements.background-change": "שינוי רקע",
      "interactive.elements.interactive-choice": "בחירה",
      "interactive.elements.decorative": "עיטור",
      "interactive.elements.narration": "הקראה",
      "interactive.clickable-text": "טקסט לחיץ",
      "interactive.clickable-text-placeholder": "הזן טקסט לאלמנט הלחיץ...",
      "interactive.audio-url": "כתובת שמע",
      "interactive.audio-url-placeholder": "https://example.com/sound.mp3",
      "interactive.audio-url-help": "הזן כתובת לקובץ שמע או השאר ריק לשימוש בטקסט-לדיבור",
      "interactive.popup-trigger": "טקסט הפעלת חלון קופץ",
      "interactive.popup-text": "תוכן החלון הקופץ",
      "interactive.narration-text": "טקסט להקראה",
      "interactive.auto-play": "הפעלה אוטומטית בטעינת העמוד",
      "interactive.add-to-page": "הוסף לעמוד",
      "interactive.added-elements": "אלמנטים שנוספו",
      "interactive.no-content": "לא צוין תוכן"
    }
  };
  
  // Translation function
  const t = (key) => {
    return translations[currentLanguage]?.[key] || translations.english[key] || key;
  };
  
  // Load language on component mount
  useEffect(() => {
    const storedLanguage = localStorage.getItem("appLanguage") || "english";
    setCurrentLanguage(storedLanguage);
    setIsRTL(storedLanguage === "hebrew" || storedLanguage === "yiddish");
    
    const handleLanguageChange = (e) => {
      const newLang = e.detail?.language || "english";
      setCurrentLanguage(newLang);
      setIsRTL(newLang === "hebrew" || newLang === "yiddish");
    };
    
    window.addEventListener('languageChanged', handleLanguageChange);
    
    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange);
    };
  }, []);
  
  // Update pageIndex when currentPageIndex changes
  useEffect(() => {
    setElementConfig(prev => ({
      ...prev,
      pageIndex: currentPageIndex
    }));
  }, [currentPageIndex]);
  
  const handleElementTypeChange = (type) => {
    setElementType(type);
    setElementConfig(prev => ({
      ...prev,
      type,
      // Reset content fields when changing type
      content: "",
      audioUrl: "",
    }));
  };
  
  const handleConfigChange = (field, value) => {
    setElementConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleAddElement = () => {
    // Validate required fields
    let isValid = true;
    let errorMessage = "";
    
    if (elementType === "clickable-audio" && !elementConfig.content) {
      isValid = false;
      errorMessage = "Please enter clickable text";
    }
    
    if (elementType === "pop-up-text" && (!elementConfig.content || !elementConfig.popupContent)) {
      isValid = false;
      errorMessage = "Please enter both trigger text and popup content";
    }
    
    if (!isValid) {
      toast({
        variant: "destructive",
        description: errorMessage
      });
      return;
    }
    
    // Create new element with unique ID
    const newElement = {
      ...elementConfig,
      id: `element-${Date.now()}`
    };
    
    // Update state
    setInteractiveElements(prev => [...prev, newElement]);
    
    // Call parent handler if provided
    if (onAddElement) {
      onAddElement(newElement);
    }
    
    toast({
      description: "Interactive element added to page",
      className: "bg-green-100 text-green-900 dark:bg-green-900/50 dark:text-green-100"
    });
    
    // Reset form for next element
    setElementConfig(prev => ({
      ...prev,
      content: "",
      audioUrl: "",
      popupContent: "",
      autoPlay: false
    }));
  };
  
  const removeElement = (elementId) => {
    setInteractiveElements(prev => prev.filter(el => el.id !== elementId));
    
    toast({
      description: "Element removed",
    });
  };
  
  // Filter elements for current page
  const currentPageElements = interactiveElements.filter(
    el => el.pageIndex === currentPageIndex
  );
  
  // Element type options with icons
  const elementTypes = [
    { id: "clickable-audio", label: t("interactive.elements.clickable-audio"), icon: <Volume2 className="h-4 w-4" /> },
    { id: "pop-up-text", label: t("interactive.elements.pop-up-text"), icon: <MessageSquare className="h-4 w-4" /> },
    { id: "animation", label: t("interactive.elements.animation"), icon: <Sparkles className="h-4 w-4" /> },
    { id: "background-change", label: t("interactive.elements.background-change"), icon: <CloudSun className="h-4 w-4" /> },
    { id: "interactive-choice", label: t("interactive.elements.interactive-choice"), icon: <MousePointer className="h-4 w-4" /> },
    { id: "decorative", label: t("interactive.elements.decorative"), icon: <Flower2 className="h-4 w-4" /> },
    { id: "narration", label: t("interactive.elements.narration"), icon: <Mic className="h-4 w-4" /> }
  ];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5 text-purple-500" />
          {t("interactive.add-element")}
        </CardTitle>
        <CardDescription>
          {t("interactive.add-element-description")}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>{t("interactive.element-type")}</Label>
          <Select value={elementType} onValueChange={handleElementTypeChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {elementTypes.map(type => (
                <SelectItem key={type.id} value={type.id}>
                  <div className="flex items-center gap-2">
                    {type.icon}
                    <span>{type.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Fields specific to element type */}
        {elementType === "clickable-audio" && (
          <>
            <div className="space-y-2">
              <Label>{t("interactive.clickable-text")}</Label>
              <Input
                value={elementConfig.content}
                onChange={(e) => handleConfigChange("content", e.target.value)}
                placeholder={t("interactive.clickable-text-placeholder")}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("interactive.audio-url")}</Label>
              <Input
                value={elementConfig.audioUrl}
                onChange={(e) => handleConfigChange("audioUrl", e.target.value)}
                placeholder={t("interactive.audio-url-placeholder")}
              />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t("interactive.audio-url-help")}
              </p>
            </div>
          </>
        )}
        
        {elementType === "pop-up-text" && (
          <>
            <div className="space-y-2">
              <Label>{t("interactive.popup-trigger")}</Label>
              <Input
                value={elementConfig.content}
                onChange={(e) => handleConfigChange("content", e.target.value)}
                placeholder={t("interactive.popup-trigger-placeholder")}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("interactive.popup-text")}</Label>
              <Input
                value={elementConfig.popupContent}
                onChange={(e) => handleConfigChange("popupContent", e.target.value)}
                placeholder={t("interactive.popup-text-placeholder")}
              />
            </div>
          </>
        )}
        
        {elementType === "narration" && (
          <>
            <div className="space-y-2">
              <Label>{t("interactive.narration-text")}</Label>
              <Input
                value={elementConfig.content}
                onChange={(e) => handleConfigChange("content", e.target.value)}
                placeholder={t("interactive.narration-text-placeholder")}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={elementConfig.autoPlay}
                onCheckedChange={(checked) => handleConfigChange("autoPlay", checked)}
              />
              <Label>{t("interactive.auto-play")}</Label>
            </div>
          </>
        )}
        
        <Button 
          onClick={handleAddElement}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t("interactive.add-to-page")}
        </Button>
      </CardContent>
      
      {currentPageElements.length > 0 && (
        <CardFooter className="flex flex-col space-y-4">
          <h3 className="text-sm font-medium">
            {t("interactive.added-elements")}
          </h3>
          <div className="space-y-2 w-full">
            {currentPageElements.map(element => (
              <div
                key={element.id}
                className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800"
              >
                <div className="flex items-center gap-2">
                  {elementTypes.find(t => t.id === element.type)?.icon}
                  <span className="text-sm">
                    {element.content || t("interactive.no-content")}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeElement(element.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}