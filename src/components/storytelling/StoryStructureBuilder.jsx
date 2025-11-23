import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  CheckCircle, 
  Circle, 
  Sparkles, 
  Mountain, 
  ArrowRight, 
  ArrowDown, 
  BookOpen,
  Layers,
  Heart
} from "lucide-react";

export default function StoryStructureBuilder({ 
  onStructureSelected,
  currentLanguage = "english",
  isRTL = false
}) {
  const [selectedStructure, setSelectedStructure] = useState(null);
  const [customStructure, setCustomStructure] = useState({
    title: "",
    stages: ["", "", "", "", ""]
  });
  
  // Translations
  const translations = {
    english: {
      title: "Story Structure Builder",
      subtitle: "Select a narrative structure for your story",
      heroJourney: "Hero's Journey",
      problemSolution: "Problem-Solution",
      friendship: "Friendship Tale",
      discovery: "Discovery Story",
      custom: "Custom Structure",
      useStructure: "Use This Structure",
      customizeStructure: "Customize",
      createCustom: "Create Custom Structure",
      customTitle: "Structure Title",
      customStage: "Stage",
      addStage: "Add Stage",
      removeStage: "Remove Stage",
      saveCustom: "Save Custom Structure",
      selectedStructure: "Selected Structure",
      structures: {
        heroJourney: {
          title: "Hero's Journey",
          description: "A classic structure where the hero leaves home, overcomes challenges, and returns transformed",
          stages: [
            "Ordinary World - The hero's normal life",
            "Call to Adventure - Something changes",
            "Meeting the Mentor - Getting guidance",
            "Crossing the Threshold - Entering the adventure",
            "Tests, Allies and Enemies - Facing challenges",
            "The Ordeal - Facing the biggest challenge",
            "Return with Reward - Coming home changed"
          ]
        },
        problemSolution: {
          title: "Problem-Solution",
          description: "A simple structure where a character faces a problem and finds a solution",
          stages: [
            "Introduction - Meet the main character",
            "Problem - Something goes wrong",
            "Failed Attempts - Try but fail to solve it",
            "Discovery - Find a new approach",
            "Solution - Solve the problem",
            "Resolution - See how things are better"
          ]
        },
        friendship: {
          title: "Friendship Tale",
          description: "A story about forming and strengthening relationships",
          stages: [
            "Meeting - Characters meet for the first time",
            "Connection - Finding common ground",
            "Enjoyment - Having fun together",
            "Challenge - Facing a problem together",
            "Conflict - Disagreement tests friendship",
            "Resolution - Rebuilding stronger friendship"
          ]
        },
        discovery: {
          title: "Discovery Story",
          description: "A journey of curiosity, exploration and learning",
          stages: [
            "Curiosity - The character wonders about something",
            "Question - Forming a specific question",
            "Exploration - Setting out to find answers",
            "Obstacle - Something makes discovery difficult",
            "Discovery - Finding the answer",
            "Sharing - Sharing knowledge with others"
          ]
        }
      }
    },
    hebrew: {
      title: "בונה מבנה סיפור",
      subtitle: "בחר מבנה נרטיבי לסיפור שלך",
      heroJourney: "מסע הגיבור",
      problemSolution: "בעיה-פתרון",
      friendship: "סיפור חברות",
      discovery: "סיפור גילוי",
      custom: "מבנה מותאם אישית",
      useStructure: "השתמש במבנה זה",
      customizeStructure: "התאם אישית",
      createCustom: "צור מבנה מותאם אישית",
      customTitle: "כותרת המבנה",
      customStage: "שלב",
      addStage: "הוסף שלב",
      removeStage: "הסר שלב",
      saveCustom: "שמור מבנה מותאם אישית",
      selectedStructure: "מבנה נבחר",
      structures: {
        heroJourney: {
          title: "מסע הגיבור",
          description: "מבנה קלאסי שבו הגיבור יוצא מביתו, מתגבר על אתגרים, וחוזר לאחר שעבר שינוי",
          stages: [
            "העולם הרגיל - חיי היומיום של הגיבור",
            "קריאה להרפתקה - משהו משתנה",
            "פגישה עם המנטור - קבלת הדרכה",
            "חציית הסף - כניסה להרפתקה",
            "מבחנים, בעלי ברית ואויבים - התמודדות עם אתגרים",
            "המשבר - התמודדות עם האתגר הגדול ביותר",
            "חזרה עם תגמול - חזרה הביתה לאחר שינוי"
          ]
        },
        problemSolution: {
          title: "בעיה-פתרון",
          description: "מבנה פשוט שבו דמות מתמודדת עם בעיה ומוצאת פתרון",
          stages: [
            "הקדמה - הכרת הדמות הראשית",
            "בעיה - משהו משתבש",
            "ניסיונות כושלים - ניסיון לפתור אך כישלון",
            "תגלית - מציאת גישה חדשה",
            "פתרון - פתרון הבעיה",
            "סיום - ראיית השיפור במצב"
          ]
        },
        friendship: {
          title: "סיפור חברות",
          description: "סיפור על יצירת וחיזוק קשרים",
          stages: [
            "פגישה - הדמויות נפגשות לראשונה",
            "חיבור - מציאת מכנה משותף",
            "הנאה - בילוי זמן מהנה יחד",
            "אתגר - התמודדות עם בעיה יחד",
            "קונפליקט - מחלוקת מעמידה את החברות במבחן",
            "פתרון - בניית חברות חזקה יותר"
          ]
        },
        discovery: {
          title: "סיפור גילוי",
          description: "מסע של סקרנות, חקירה ולמידה",
          stages: [
            "סקרנות - הדמות תוהה על משהו",
            "שאלה - גיבוש שאלה ספציפית",
            "חקירה - יציאה למציאת תשובות",
            "מכשול - משהו מקשה על הגילוי",
            "תגלית - מציאת התשובה",
            "שיתוף - שיתוף הידע עם אחרים"
          ]
        }
      }
    }
  };
  
  // Translation function
  const t = (key) => {
    const keys = key.split(".");
    let result = translations[currentLanguage] || translations.english;
    
    for (const k of keys) {
      if (result[k] === undefined) {
        // Fallback to English
        result = translations.english;
        for (const fallbackKey of keys) {
          result = result[fallbackKey];
          if (result === undefined) break;
        }
        break;
      }
      result = result[k];
    }
    
    return result || key;
  };
  
  // Structure options
  const structures = [
    {
      id: "heroJourney",
      name: t("heroJourney"),
      icon: Mountain,
      data: t("structures.heroJourney")
    },
    {
      id: "problemSolution",
      name: t("problemSolution"),
      icon: Circle,
      data: t("structures.problemSolution")
    },
    {
      id: "friendship",
      name: t("friendship"),
      icon: Heart,
      data: t("structures.friendship")
    },
    {
      id: "discovery",
      name: t("discovery"),
      icon: Sparkles,
      data: t("structures.discovery")
    }
  ];
  
  // Handle adding or removing custom stages
  const handleAddStage = () => {
    setCustomStructure({
      ...customStructure,
      stages: [...customStructure.stages, ""]
    });
  };
  
  const handleRemoveStage = () => {
    if (customStructure.stages.length <= 1) return;
    
    setCustomStructure({
      ...customStructure,
      stages: customStructure.stages.slice(0, -1)
    });
  };
  
  // Handle stage content change
  const handleStageChange = (index, value) => {
    const newStages = [...customStructure.stages];
    newStages[index] = value;
    
    setCustomStructure({
      ...customStructure,
      stages: newStages
    });
  };
  
  // Handle saving custom structure
  const handleSaveCustom = () => {
    if (!customStructure.title) return;
    
    const customData = {
      title: customStructure.title,
      description: "Custom story structure",
      stages: customStructure.stages.filter(stage => stage.trim() !== "")
    };
    
    setSelectedStructure({
      id: "custom",
      name: customStructure.title,
      icon: Layers,
      data: customData
    });
  };
  
  // Use the selected structure
  const handleUseStructure = () => {
    if (!selectedStructure) return;
    
    if (onStructureSelected) {
      onStructureSelected(selectedStructure);
    }
  };
  
  return (
    <Card className="shadow-md" dir={isRTL ? "rtl" : "ltr"}>
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-purple-500" />
          {t("title")}
        </CardTitle>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t("subtitle")}
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <Tabs defaultValue="structures">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="structures">Structures</TabsTrigger>
            <TabsTrigger value="custom">Custom</TabsTrigger>
          </TabsList>
          
          <TabsContent value="structures" className="space-y-6">
            <RadioGroup 
              value={selectedStructure?.id || ""}
              onValueChange={(value) => {
                const structure = structures.find(s => s.id === value);
                setSelectedStructure(structure);
              }}
              className="space-y-3"
            >
              {structures.map((structure) => (
                <div key={structure.id} className="flex">
                  <RadioGroupItem 
                    value={structure.id} 
                    id={structure.id}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={structure.id}
                    className="flex flex-grow items-start gap-4 rounded-lg border border-gray-200 dark:border-gray-800 p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 peer-data-[state=checked]:border-purple-500 dark:peer-data-[state=checked]:border-purple-500 peer-data-[state=checked]:bg-purple-50 dark:peer-data-[state=checked]:bg-purple-900/10"
                  >
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                      <structure.icon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-medium text-gray-900 dark:text-white">{structure.data.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{structure.data.description}</p>
                      
                      <div className="space-y-1 mt-3">
                        {structure.data.stages.map((stage, index) => (
                          <div key={index} className="flex items-start gap-2 text-sm">
                            <div className="p-1 rounded-full bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5">
                              {index < structure.data.stages.length - 1 ? (
                                <ArrowDown className="h-3 w-3" />
                              ) : (
                                <CheckCircle className="h-3 w-3" />
                              )}
                            </div>
                            <p>{stage}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </TabsContent>
          
          <TabsContent value="custom" className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="custom-title">{t("customTitle")}</Label>
                <Input
                  id="custom-title"
                  value={customStructure.title}
                  onChange={(e) => setCustomStructure({...customStructure, title: e.target.value})}
                  placeholder="Enter a name for your structure"
                />
              </div>
              
              {customStructure.stages.map((stage, index) => (
                <div key={index} className="space-y-2">
                  <Label htmlFor={`stage-${index}`}>{t("customStage")} {index + 1}</Label>
                  <Input
                    id={`stage-${index}`}
                    value={stage}
                    onChange={(e) => handleStageChange(index, e.target.value)}
                    placeholder={`Enter description for stage ${index + 1}`}
                  />
                </div>
              ))}
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleAddStage}
                  className="flex-grow"
                >
                  {t("addStage")}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={handleRemoveStage}
                  disabled={customStructure.stages.length <= 1}
                  className="flex-grow"
                >
                  {t("removeStage")}
                </Button>
              </div>
              
              <Button
                onClick={handleSaveCustom}
                disabled={!customStructure.title}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {t("saveCustom")}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
        
        {selectedStructure && (
          <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-gray-900 dark:text-white">
                {t("selectedStructure")}: <span className="text-purple-600 dark:text-purple-400">{selectedStructure.data.title}</span>
              </h3>
              
              <Button 
                onClick={handleUseStructure}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {t("useStructure")}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}