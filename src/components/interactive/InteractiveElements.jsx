import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Gamepad2, 
  MousePointer, 
  Mic, 
  MessageSquare, 
  ListTodo,
  PanelTop
} from "lucide-react";

export default function InteractiveElements({
  onAddInteractive,
  currentLanguage = "english",
  isRTL = false
}) {
  const [selectedType, setSelectedType] = useState("clickable");
  const [interactiveSettings, setInteractiveSettings] = useState({
    name: "",
    description: "",
    options: ["", ""],
    correctAnswer: "",
    reward: ""
  });

  // Translations
  const translations = {
    english: {
      title: "Interactive Elements",
      subtitle: "Add interactive elements to make your story engaging",
      types: {
        title: "Element Type",
        clickable: "Clickable Element",
        quiz: "Quiz Question",
        decision: "Decision Point",
        task: "Completion Task",
        soundEffect: "Sound Effect",
        animation: "Animation"
      },
      name: "Element Name",
      namePlaceholder: "Name your interactive element",
      description: "Description",
      descriptionPlaceholder: "Describe what happens when interacted with",
      options: "Options",
      optionsDescription: "Add options for quiz or decision points",
      option: "Option",
      addOption: "Add Option",
      correctAnswer: "Correct Answer",
      correctAnswerPlaceholder: "For quiz elements",
      reward: "Reward/Outcome",
      rewardPlaceholder: "What happens when completed correctly",
      addButton: "Add Interactive Element"
    },
    hebrew: {
      title: "אלמנטים אינטראקטיביים",
      subtitle: "הוסף אלמנטים אינטראקטיביים כדי להפוך את הסיפור שלך למעניין",
      types: {
        title: "סוג אלמנט",
        clickable: "אלמנט לחיץ",
        quiz: "שאלת חידון",
        decision: "נקודת החלטה",
        task: "משימה להשלמה",
        soundEffect: "אפקט קולי",
        animation: "אנימציה"
      },
      name: "שם האלמנט",
      namePlaceholder: "תן שם לאלמנט האינטראקטיבי",
      description: "תיאור",
      descriptionPlaceholder: "תאר מה קורה כאשר מתבצעת אינטראקציה עם האלמנט",
      options: "אפשרויות",
      optionsDescription: "הוסף אפשרויות לחידון או נקודות החלטה",
      option: "אפשרות",
      addOption: "הוסף אפשרות",
      correctAnswer: "תשובה נכונה",
      correctAnswerPlaceholder: "עבור אלמנטי חידון",
      reward: "פרס/תוצאה",
      rewardPlaceholder: "מה קורה כאשר הושלם בהצלחה",
      addButton: "הוסף אלמנט אינטראקטיבי"
    }
  };

  const t = (key) => {
    const [section, subsection, item] = key.split(".");
    if (subsection && item) {
      return translations[currentLanguage]?.[subsection]?.[item] || 
             translations.english[subsection][item];
    } else if (subsection) {
      return translations[currentLanguage]?.[subsection] || 
             translations.english[subsection];
    }
    return key;
  };

  const handleInputChange = (field, value) => {
    setInteractiveSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...interactiveSettings.options];
    newOptions[index] = value;
    handleInputChange("options", newOptions);
  };

  const addOption = () => {
    handleInputChange("options", [...interactiveSettings.options, ""]);
  };

  const handleSubmit = () => {
    const element = {
      type: selectedType,
      ...interactiveSettings
    };
    onAddInteractive(element);
    
    // Reset form
    setSelectedType("clickable");
    setInteractiveSettings({
      name: "",
      description: "",
      options: ["", ""],
      correctAnswer: "",
      reward: ""
    });
  };

  // Interactive element icons
  const ElementIcon = {
    clickable: <MousePointer className="h-5 w-5" />,
    quiz: <PanelTop className="h-5 w-5" />,
    decision: <ListTodo className="h-5 w-5" />,
    task: <MessageSquare className="h-5 w-5" />,
    soundEffect: <Mic className="h-5 w-5" />,
    animation: <Gamepad2 className="h-5 w-5" />
  };

  return (
    <Card className="shadow-md" dir={isRTL ? "rtl" : "ltr"}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gamepad2 className="h-5 w-5 text-purple-500" />
          {t("title")}
        </CardTitle>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t("subtitle")}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label>{t("types.title")}</Label>
          <RadioGroup 
            value={selectedType} 
            onValueChange={setSelectedType}
            className="grid grid-cols-2 md:grid-cols-3 gap-3"
          >
            {Object.entries({
              clickable: t("types.clickable"),
              quiz: t("types.quiz"),
              decision: t("types.decision"),
              task: t("types.task"),
              soundEffect: t("types.soundEffect"),
              animation: t("types.animation")
            }).map(([value, label]) => (
              <div 
                key={value}
                className={`flex items-center space-x-2 border rounded-md p-3 cursor-pointer transition-colors ${
                  selectedType === value 
                    ? "bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800" 
                    : "border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50"
                }`}
                onClick={() => setSelectedType(value)}
              >
                <RadioGroupItem value={value} id={`type-${value}`} />
                <div className="flex items-center flex-1">
                  {ElementIcon[value]}
                  <Label htmlFor={`type-${value}`} className="ml-2 cursor-pointer">
                    {label}
                  </Label>
                </div>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="space-y-3">
          <Label htmlFor="element-name">{t("name")}</Label>
          <Input 
            id="element-name"
            value={interactiveSettings.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder={t("namePlaceholder")}
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="element-description">{t("description")}</Label>
          <Input 
            id="element-description"
            value={interactiveSettings.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            placeholder={t("descriptionPlaceholder")}
          />
        </div>

        {(selectedType === "quiz" || selectedType === "decision") && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>{t("options")}</Label>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={addOption}
              >
                {t("addOption")}
              </Button>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 -mt-2">
              {t("optionsDescription")}
            </p>
            
            {interactiveSettings.options.map((option, index) => (
              <div key={index} className="flex items-center gap-3">
                <span className="text-sm text-gray-500 w-20">{t("option")} {index + 1}</span>
                <Input
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`${t("option")} ${index + 1}`}
                />
              </div>
            ))}
          </div>
        )}

        {selectedType === "quiz" && (
          <div className="space-y-3">
            <Label htmlFor="correct-answer">{t("correctAnswer")}</Label>
            <Input 
              id="correct-answer"
              value={interactiveSettings.correctAnswer}
              onChange={(e) => handleInputChange("correctAnswer", e.target.value)}
              placeholder={t("correctAnswerPlaceholder")}
            />
          </div>
        )}

        <div className="space-y-3">
          <Label htmlFor="reward">{t("reward")}</Label>
          <Input 
            id="reward"
            value={interactiveSettings.reward}
            onChange={(e) => handleInputChange("reward", e.target.value)}
            placeholder={t("rewardPlaceholder")}
          />
        </div>

        <Button 
          onClick={handleSubmit}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
        >
          {t("addButton")}
        </Button>
      </CardContent>
    </Card>
  );
}