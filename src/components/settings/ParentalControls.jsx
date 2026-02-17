import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Shield, Save, Lock, AlertTriangle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { getParentalControls, saveParentalControls } from "@/utils/content-moderation";

/**
 * ParentalControls - Parental controls settings panel.
 * Manages content filtering level, daily limits, sharing permissions, etc.
 */
export default function ParentalControls({ currentLanguage, isRTL }) {
  const { toast } = useToast();
  const isHebrew = currentLanguage === "hebrew";
  const [controls, setControls] = useState(getParentalControls());
  const [isSaving, setIsSaving] = useState(false);

  const t = (he, en) => (isHebrew ? he : en);

  const updateControl = (key, value) => {
    setControls((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    setIsSaving(true);
    saveParentalControls(controls);
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: t("הגדרות נשמרו", "Settings saved"),
        description: t("הגדרות בקרת ההורים עודכנו בהצלחה", "Parental controls have been updated"),
        className: "bg-green-100 text-green-900 dark:bg-green-900/50 dark:text-green-100"
      });
    }, 300);
  };

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header info */}
      <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
        <CardContent className="p-4">
          <div className={`flex items-start gap-3 ${isRTL ? "flex-row-reverse text-right" : ""}`}>
            <Lock className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                {t("בקרת הורים", "Parental Controls")}
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                {t(
                  "הגדרות אלו מאפשרות לך לשלוט בתוכן שהילד שלך יכול ליצור ולצפות. בגרסה עתידית תוכל להגן על ההגדרות עם סיסמה.",
                  "These settings let you control what content your child can create and view. In a future version, you'll be able to protect these settings with a password."
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Filter Level */}
      <Card>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse text-right" : ""}`}>
            <Shield className="h-5 w-5 text-purple-600" />
            {t("רמת סינון תוכן", "Content Filter Level")}
          </CardTitle>
          <CardDescription className={isRTL ? "text-right" : ""}>
            {t("קבע את רמת הסינון עבור תוכן שנוצר על ידי AI", "Set the filtering level for AI-generated content")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select
            value={controls.contentFilterLevel}
            onValueChange={(value) => updateControl("contentFilterLevel", value)}
          >
            <SelectTrigger aria-label={t("בחר רמת סינון", "Select filter level")}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="strict">
                {t("מחמיר - מומלץ לגילאי 3-5", "Strict - Recommended for ages 3-5")}
              </SelectItem>
              <SelectItem value="moderate">
                {t("בינוני - מומלץ לגילאי 5-8", "Moderate - Recommended for ages 5-8")}
              </SelectItem>
              <SelectItem value="relaxed">
                {t("מרוכך - מומלץ לגילאי 8-12", "Relaxed - Recommended for ages 8-12")}
              </SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Age Range */}
      <Card>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse text-right" : ""}`}>
            {t("טווח גילאים", "Age Range")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={controls.ageRange}
            onValueChange={(value) => updateControl("ageRange", value)}
          >
            <SelectTrigger aria-label={t("בחר טווח גילאים", "Select age range")}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3-5">{t("גילאי 3-5", "Ages 3-5")}</SelectItem>
              <SelectItem value="5-7">{t("גילאי 5-7", "Ages 5-7")}</SelectItem>
              <SelectItem value="7-10">{t("גילאי 7-10", "Ages 7-10")}</SelectItem>
              <SelectItem value="10-12">{t("גילאי 10-12", "Ages 10-12")}</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Toggles */}
      <Card>
        <CardHeader>
          <CardTitle className={isRTL ? "text-right" : ""}>
            {t("הרשאות", "Permissions")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Allow AI generation */}
          <div className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}>
            <Label className={isRTL ? "text-right" : ""}>
              {t("אפשר יצירת תוכן עם AI", "Allow AI content generation")}
            </Label>
            <Switch
              checked={controls.allowAIGeneration}
              onCheckedChange={(checked) => updateControl("allowAIGeneration", checked)}
              aria-label={t("אפשר יצירת תוכן עם AI", "Allow AI content generation")}
            />
          </div>

          {/* Allow community sharing */}
          <div className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}>
            <Label className={isRTL ? "text-right" : ""}>
              {t("אפשר שיתוף בקהילה", "Allow community sharing")}
            </Label>
            <Switch
              checked={controls.allowCommunitySharing}
              onCheckedChange={(checked) => updateControl("allowCommunitySharing", checked)}
              aria-label={t("אפשר שיתוף בקהילה", "Allow community sharing")}
            />
          </div>

          {/* Require approval before publish */}
          <div className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}>
            <Label className={isRTL ? "text-right" : ""}>
              {t("דרוש אישור הורה לפני פרסום", "Require parent approval before publishing")}
            </Label>
            <Switch
              checked={controls.requireApprovalBeforePublish}
              onCheckedChange={(checked) => updateControl("requireApprovalBeforePublish", checked)}
              aria-label={t("דרוש אישור הורה לפני פרסום", "Require parent approval before publishing")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Daily book limit */}
      <Card>
        <CardHeader>
          <CardTitle className={isRTL ? "text-right" : ""}>
            {t("מגבלה יומית", "Daily Limit")}
          </CardTitle>
          <CardDescription className={isRTL ? "text-right" : ""}>
            {t("מספר ספרים מקסימלי שניתן ליצור ביום", "Maximum number of books that can be created per day")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
            <Input
              type="number"
              min={1}
              max={20}
              value={controls.maxDailyBooks}
              onChange={(e) => updateControl("maxDailyBooks", parseInt(e.target.value) || 1)}
              className="w-24"
              aria-label={t("מספר ספרים ביום", "Books per day")}
            />
            <span className="text-sm text-gray-500">
              {t("ספרים ביום", "books per day")}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Save button */}
      <Button
        onClick={handleSave}
        disabled={isSaving}
        className="w-full bg-purple-600 hover:bg-purple-700 gap-2"
        aria-label={t("שמור הגדרות", "Save settings")}
      >
        <Save className="h-4 w-4" aria-hidden="true" />
        {isSaving ? t("שומר...", "Saving...") : t("שמור הגדרות בקרת הורים", "Save Parental Controls")}
      </Button>
    </div>
  );
}
