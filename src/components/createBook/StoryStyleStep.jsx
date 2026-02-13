
import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Sparkles, Loader2, Settings } from "lucide-react";
import { GenerateImage } from "@/integrations/Core";
import AIStudio from '../ai/AIStudio';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge"; // Added for selected AI model info

export default function StoryStyleStep({ bookData, updateBookData }) {
  const [currentLanguage, setCurrentLanguage] = useState("english");
  const [isRTL, setIsRTL] = useState(false);
  const [loadingStyles, setLoadingStyles] = useState({});
  const [styleImages, setStyleImages] = useState({
    disney: null,
    pixar: null,
    watercolor: null,
    sketch: null,
    cartoon: null,
    realistic: null,
    anime: null,
    clay: null,
    popup: null,
    minimalist: null,
    vintage: null,
    cultural: null
  });
  
  const [aiStudioOpen, setAiStudioOpen] = useState(false);
  const [selectedAIModel, setSelectedAIModel] = useState(null);
  const [userTier, setUserTier] = useState("free"); // This would come from user context
  
  // Load language preference
  useEffect(() => {
    const storedLanguage = localStorage.getItem("appLanguage");
    if (storedLanguage) {
      setCurrentLanguage(storedLanguage);
      setIsRTL(storedLanguage === "hebrew" || storedLanguage === "yiddish");
    }
    
    const handleStorageChange = (e) => {
      if (e.key === "appLanguage") {
        setCurrentLanguage(e.newValue || "english");
        setIsRTL(e.newValue === "hebrew" || e.newValue === "yiddish");
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Load cached style images or generate them
    loadStyleImages();
    
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  const loadStyleImages = async () => {
    // Check localStorage for cached images first
    const cachedImages = {};
    let needToGenerate = false;
    
    for (const style of Object.keys(styleImages)) {
      const cachedImage = localStorage.getItem(`artStyle_${style}`);
      if (cachedImage) {
        cachedImages[style] = cachedImage;
      } else {
        needToGenerate = true;
      }
    }
    
    setStyleImages(prev => ({...prev, ...cachedImages}));
    
    // Generate missing style images
    if (needToGenerate) {
      for (const style of Object.keys(styleImages)) {
        if (!cachedImages[style]) {
          generateStyleImage(style);
        }
      }
    }
  };
  
  const generateStyleImage = async (style) => {
    setLoadingStyles(prev => ({...prev, [style]: true}));
    
    try {
      // Create a prompt specific to this art style showing a child character
      const childGender = bookData.child_gender || "neutral";
      const childAge = bookData.child_age || 8;
      
      let characterDesc = "";
      if (childGender === "boy") {
        characterDesc = "a young boy";
      } else if (childGender === "girl") {
        characterDesc = "a young girl";
      } else {
        characterDesc = "a young child";
      }
      
      const prompt = `Illustration of ${characterDesc} around ${childAge} years old on an adventure, ${style} art style, high quality, cheerful, colorful, children's book illustration, detailed background`;
      
      const result = await GenerateImage({ prompt });
      
      if (result && result.url) {
        // Cache the image URL in localStorage
        localStorage.setItem(`artStyle_${style}`, result.url);
        
        // Update the style images state
        setStyleImages(prev => ({
          ...prev,
          [style]: result.url
        }));
      }
    } catch (error) {
      // silently handled
    } finally {
      setLoadingStyles(prev => ({...prev, [style]: false}));
    }
  };

  const handleAIModelChange = (model) => {
    setSelectedAIModel(model);
    // Also update the art style in bookData if the model suggests a specific style
    if (model.recommendedStyle) {
      updateBookData('art_style', model.recommendedStyle);
    }
  };
  
  // Translations
  const translations = {
    english: {
      "style.title": "Choose Art Style",
      "style.subtitle": "Select the visual style for your story's illustrations",
      "style.artStyle": "Art Style",
      "style.disney": "Disney",
      "style.disney.description": "Magical, expressive characters with smooth animation style",
      "style.pixar": "Pixar",
      "style.pixar.description": "3D animation with detailed textures and expressive features",
      "style.watercolor": "Watercolor",
      "style.watercolor.description": "Soft, flowing illustrations with gentle color blending",
      "style.sketch": "Sketch",
      "style.sketch.description": "Hand-drawn pencil illustrations with detailed linework",
      "style.cartoon": "Cartoon",
      "style.cartoon.description": "Bold outlines with simple, vibrant colors",
      "style.realistic": "Realistic",
      "style.realistic.description": "Detailed illustrations with natural proportions and textures",
      "style.anime": "Anime",
      "style.anime.description": "Japanese-inspired style with characteristic eyes and expressions",
      "style.clay": "Clay Animation",
      "style.clay.description": "3D style reminiscent of clay or plasticine figures",
      "style.popup": "Pop-up Book",
      "style.popup.description": "3D paper craft style with fold and cut aesthetics",
      "style.minimalist": "Minimalist",
      "style.minimalist.description": "Simple shapes and limited color palette with clean design",
      "style.vintage": "Vintage",
      "style.vintage.description": "Classic illustration style reminiscent of older children's books",
      "style.cultural": "Cultural",
      "style.cultural.description": "Incorporates traditional art elements from various cultures"
    },
    hebrew: {
      "style.title": "בחירת סגנון אמנותי",
      "style.subtitle": "בחר את הסגנון החזותי לאיורי הסיפור שלך",
      "style.artStyle": "סגנון אמנותי",
      "style.disney": "דיסני",
      "style.disney.description": "דמויות קסומות ומבטאות עם סגנון הנפשה חלק",
      "style.pixar": "פיקסאר",
      "style.pixar.description": "הנפשה תלת-ממדית עם מרקמים מפורטים ותכונות מבטאות",
      "style.watercolor": "צבעי מים",
      "style.watercolor.description": "איורים רכים וזורמים עם מיזוג צבעים עדין",
      "style.sketch": "סקיצה",
      "style.sketch.description": "איורי עפרון מצוירים ביד עם קווים מפורטים",
      "style.cartoon": "קריקטורה",
      "style.cartoon.description": "קווי מתאר מודגשים עם צבעים פשוטים וחיים",
      "style.realistic": "ריאליסטי",
      "style.realistic.description": "איורים מפורטים עם פרופורציות ומרקמים טבעיים",
      "style.anime": "אנימה",
      "style.anime.description": "סגנון בהשראה יפנית עם עיניים והבעות אופייניות",
      "style.clay": "הנפשת חימר",
      "style.clay.description": "סגנון תלת-ממדי המזכיר דמויות חימר או פלסטלינה",
      "style.popup": "ספר פופ-אפ",
      "style.popup.description": "סגנון יצירת נייר תלת-ממדי עם אסתטיקה של קיפול וחיתוך",
      "style.minimalist": "מינימליסטי",
      "style.minimalist.description": "צורות פשוטות ופלטת צבעים מוגבלת עם עיצוב נקי",
      "style.vintage": "וינטג'",
      "style.vintage.description": "סגנון איור קלאסי המזכיר ספרי ילדים ישנים יותר",
      "style.cultural": "תרבותי",
      "style.cultural.description": "משלב אלמנטים אמנותיים מסורתיים מתרבויות שונות"
    },
    yiddish: {
      "style.title": "אויסקלייַבן קונסט סטיל",
      "style.subtitle": "אויסקלייַבן די וויזשאַוואַל סטיל פֿאַר דײַן געשיכטע בילדער",
      "style.artStyle": "קונסט סטיל",
      "style.disney": "דיזני",
      "style.disney.description": "מאַגישע, אויסדרוקפולע כאראַקטערן מיט גלאַטע אַנימאַציע סטיל",
      "style.pixar": "פּיקסאַר",
      "style.pixar.description": "3D אַנימאַציע מיט דיטיילטע טעקסטורן און אויסדרוקפולע אייגנשאַפטן",
      "style.watercolor": "וואַסערפאַרב",
      "style.watercolor.description": "ווייכע, פֿליסיקע אילוסטראַציעס מיט צאַרטע קאָלירן מישן",
      "style.sketch": "סקיצע",
      "style.sketch.description": "האַנט-געצייכנטע בלייַער אילוסטראַציעס מיט דיטיילטע ליניעאַרבעט",
      "style.cartoon": "קאַרטון",
      "style.cartoon.description": "דייקע קאָנטורן מיט פּשוטע, לעבעדיקע פאַרבן",
      "style.realistic": "רעאַליסטיש",
      "style.realistic.description": "דיטיילטע אילוסטראַציעס מיט נאַטירלעכע פּראָפּאָרציעס און טעקסטורן",
      "style.anime": "אַנימע",
      "style.anime.description": "יאַפּאַניש-אינספּירירט סטיל מיט כאַראַקטעריסטישע אויגן און אויסדרוקן",
      "style.clay": "לעי אַנימאַציע",
      "style.clay.description": "3D סטיל וואָס דערמאָנט ליים אָדער פּלאַסטילין פיגורן",
      "style.popup": "פּאָפּ-אַפּ בוך",
      "style.popup.description": "3D פּאַפּיר קראַפט סטיל מיט פֿאָלד און שניט עסטעטיק",
      "style.minimalist": "מינימאַליסטיש",
      "style.minimalist.description": "פּשוטע פאָרמען און באַגרענעצטע קאָלירן פּאַלעטע מיט ריינעם פּלאַן",
      "style.vintage": "ווינטאַגע",
      "style.vintage.description": "קלאַסישער אילוסטראַציע סטיל וואָס דערמאָנט עלטערע קינדער ביכער",
      "style.cultural": "קולטורעל",
      "style.cultural.description": "אַרייננעמט טראַדיציאָנעלע קונסט עלעמענטן פֿון פאַרשידענע קולטורן"
    }
  };
  
  // Translation function
  const t = (key) => {
    return translations[currentLanguage]?.[key] || translations.english[key] || key;
  };

  // Removed handleChange as it's inlined in RadioGroup onValueChange
  // const handleChange = (field, value) => {
  //   updateBookData(field, value);
  // };

  const artStyles = [
    {
      id: "disney",
      title: t("style.disney"),
      description: t("style.disney.description"),
      image: styleImages.disney
    },
    {
      id: "pixar",
      title: t("style.pixar"),
      description: t("style.pixar.description"),
      image: styleImages.pixar
    },
    {
      id: "watercolor",
      title: t("style.watercolor"),
      description: t("style.watercolor.description"),
      image: styleImages.watercolor
    },
    {
      id: "sketch",
      title: t("style.sketch"),
      description: t("style.sketch.description"),
      image: styleImages.sketch
    },
    {
      id: "cartoon",
      title: t("style.cartoon"),
      description: t("style.cartoon.description"),
      image: styleImages.cartoon
    },
    {
      id: "realistic",
      title: t("style.realistic"),
      description: t("style.realistic.description"),
      image: styleImages.realistic
    },
    {
      id: "anime",
      title: t("style.anime"),
      description: t("style.anime.description"),
      image: styleImages.anime
    },
    {
      id: "clay",
      title: t("style.clay"),
      description: t("style.clay.description"),
      image: styleImages.clay
    },
    {
      id: "popup",
      title: t("style.popup"),
      description: t("style.popup.description"),
      image: styleImages.popup
    },
    {
      id: "minimalist",
      title: t("style.minimalist"),
      description: t("style.minimalist.description"),
      image: styleImages.minimalist
    },
    {
      id: "vintage",
      title: t("style.vintage"),
      description: t("style.vintage.description"),
      image: styleImages.vintage
    },
    {
      id: "cultural",
      title: t("style.cultural"),
      description: t("style.cultural.description"),
      image: styleImages.cultural
    }
  ];

  return (
    <Card className="bg-white dark:bg-gray-800 shadow-md" dir={isRTL ? "rtl" : "ltr"}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl text-gray-900 dark:text-white">
              {t("style.title")}
            </CardTitle>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {t("style.subtitle")}
            </p>
          </div>
          
          {/* AI Studio Access Button */}
          <Dialog open={aiStudioOpen} onOpenChange={setAiStudioOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                AI Studio
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>AI Studio - Image Generation</DialogTitle>
              </DialogHeader>
              <AIStudio
                currentModel={selectedAIModel}
                onModelChange={handleAIModelChange}
                userTier={userTier}
                credits={{ used: 25, total: 50 }}
                currentLanguage={currentLanguage}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Display selected AI model info */}
          {selectedAIModel && (
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-purple-900 dark:text-purple-100">
                    Selected AI Model: {selectedAIModel.name}
                  </h4>
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    {selectedAIModel.provider} • {selectedAIModel.credits} credits per image
                  </p>
                </div>
                <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                  {selectedAIModel.tier}
                </Badge>
              </div>
            </div>
          )}

          <Label>{t("style.artStyle")}</Label>
          <RadioGroup
            value={bookData.art_style}
            onValueChange={(value) => updateBookData("art_style", value)}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {artStyles.map((style) => (
              <div
                key={style.id}
                className={`relative flex flex-col h-full rounded-lg border overflow-hidden transition-all hover:shadow-md ${
                  bookData.art_style === style.id
                    ? "border-purple-500 bg-purple-50 dark:border-purple-600 dark:bg-purple-900/20"
                    : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
                }`}
              >
                <div className="relative aspect-video bg-gray-100 dark:bg-gray-800">
                  {style.image ? (
                    <img
                      src={style.image}
                      alt={style.title}
                      className="w-full h-full object-cover"
                    />
                  ) : loadingStyles[style.id] ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                      <Sparkles className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex items-start gap-3">
                    <RadioGroupItem value={style.id} id={style.id} className="mt-1" />
                    <div className="flex-1">
                      <Label
                        htmlFor={style.id}
                        className="text-base font-medium leading-none mb-1 block cursor-pointer"
                      >
                        {style.title}
                      </Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {style.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  );
}
