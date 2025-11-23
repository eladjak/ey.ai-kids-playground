import React from 'react';
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

export default function RhymeOptions({ rhymeSettings, setRhymeSettings, currentLanguage = "english" }) {
  // Translations
  const translations = {
    english: {
      "rhyme.pattern": "Rhyme Pattern",
      "rhyme.pattern.aabb": "AABB (pairs)",
      "rhyme.pattern.abab": "ABAB (alternating)",
      "rhyme.pattern.abcb": "ABCB (second & fourth)",
      "rhyme.pattern.abba": "ABBA (envelope)",
      "rhyme.pattern.monorhyme": "Monorhyme (AAAA)",
      "rhyme.meter": "Meter",
      "rhyme.meter.iambic": "Iambic (da-DUM)",
      "rhyme.meter.trochaic": "Trochaic (DUM-da)",
      "rhyme.meter.anapestic": "Anapestic (da-da-DUM)",
      "rhyme.meter.dactylic": "Dactylic (DUM-da-da)",
      "rhyme.meter.free": "Free Verse",
      "rhyme.complexity": "Complexity",
      "rhyme.complexity.simple": "Simple",
      "rhyme.complexity.moderate": "Moderate",
      "rhyme.complexity.complex": "Complex"
    },
    hebrew: {
      "rhyme.pattern": "תבנית חריזה",
      "rhyme.pattern.aabb": "אאבב (זוגות)",
      "rhyme.pattern.abab": "אבאב (לסירוגין)",
      "rhyme.pattern.abcb": "אבגב (שני ורביעי)",
      "rhyme.pattern.abba": "אבבא (מעטפת)",
      "rhyme.pattern.monorhyme": "מונוריים (אאאא)",
      "rhyme.meter": "משקל",
      "rhyme.meter.iambic": "ימבי (תש-TA)",
      "rhyme.meter.trochaic": "טרוכי (TA-תש)",
      "rhyme.meter.anapestic": "אנפסטי (תש-תש-TA)",
      "rhyme.meter.dactylic": "דקטילי (TA-תש-תש)",
      "rhyme.meter.free": "חופשי",
      "rhyme.complexity": "מורכבות",
      "rhyme.complexity.simple": "פשוטה",
      "rhyme.complexity.moderate": "בינונית",
      "rhyme.complexity.complex": "מורכבת"
    }
  };
  
  // Translation function
  const t = (key) => {
    return translations[currentLanguage]?.[key] || translations.english[key] || key;
  };
  
  // Is RTL
  const isRTL = currentLanguage === "hebrew" || currentLanguage === "yiddish";
  
  const handleChange = (field, value) => {
    setRhymeSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  return (
    <div className="space-y-4" dir={isRTL ? "rtl" : "ltr"}>
      <div className="space-y-2">
        <Label htmlFor="rhymePattern">{t("rhyme.pattern")}</Label>
        <Select
          id="rhymePattern"
          value={rhymeSettings.pattern}
          onValueChange={(value) => handleChange("pattern", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder={t("rhyme.pattern")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="aabb">{t("rhyme.pattern.aabb")}</SelectItem>
            <SelectItem value="abab">{t("rhyme.pattern.abab")}</SelectItem>
            <SelectItem value="abcb">{t("rhyme.pattern.abcb")}</SelectItem>
            <SelectItem value="abba">{t("rhyme.pattern.abba")}</SelectItem>
            <SelectItem value="monorhyme">{t("rhyme.pattern.monorhyme")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="rhymeMeter">{t("rhyme.meter")}</Label>
        <Select
          id="rhymeMeter"
          value={rhymeSettings.meter}
          onValueChange={(value) => handleChange("meter", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder={t("rhyme.meter")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="iambic">{t("rhyme.meter.iambic")}</SelectItem>
            <SelectItem value="trochaic">{t("rhyme.meter.trochaic")}</SelectItem>
            <SelectItem value="anapestic">{t("rhyme.meter.anapestic")}</SelectItem>
            <SelectItem value="dactylic">{t("rhyme.meter.dactylic")}</SelectItem>
            <SelectItem value="free">{t("rhyme.meter.free")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label htmlFor="complexity">{t("rhyme.complexity")}</Label>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {rhymeSettings.complexity === "simple" ? t("rhyme.complexity.simple") : 
             rhymeSettings.complexity === "moderate" ? t("rhyme.complexity.moderate") : 
             t("rhyme.complexity.complex")}
          </span>
        </div>
        <Select
          id="complexity"
          value={rhymeSettings.complexity}
          onValueChange={(value) => handleChange("complexity", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder={t("rhyme.complexity")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="simple">{t("rhyme.complexity.simple")}</SelectItem>
            <SelectItem value="moderate">{t("rhyme.complexity.moderate")}</SelectItem>
            <SelectItem value="complex">{t("rhyme.complexity.complex")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}