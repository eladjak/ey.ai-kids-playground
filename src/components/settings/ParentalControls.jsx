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
import { Shield, Save, Lock, AlertTriangle, KeyRound, Check, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  getParentalControls,
  saveParentalControls,
  isPinSet,
  setParentalPin,
  verifyParentalPin,
  removeParentalPin,
} from "@/utils/content-moderation";

/**
 * ParentalControls - Parental controls settings panel with PIN protection.
 * PIN code required to view/modify settings when set.
 */
export default function ParentalControls({ currentLanguage, isRTL }) {
  const { toast } = useToast();
  const isHebrew = currentLanguage === "hebrew";
  const [controls, setControls] = useState(getParentalControls());
  const [isSaving, setIsSaving] = useState(false);

  // PIN state
  const [hasPinSet, setHasPinSet] = useState(isPinSet());
  const [isUnlocked, setIsUnlocked] = useState(!isPinSet());
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);

  // PIN setup state
  const [isSettingPin, setIsSettingPin] = useState(false);
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinSetupError, setPinSetupError] = useState("");

  // PIN removal state
  const [isRemovingPin, setIsRemovingPin] = useState(false);
  const [removeConfirmPin, setRemoveConfirmPin] = useState("");

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

  const handlePinUnlock = async () => {
    if (await verifyParentalPin(pinInput)) {
      setIsUnlocked(true);
      setPinError(false);
      setPinInput("");
    } else {
      setPinError(true);
      setPinInput("");
    }
  };

  const handleSetPin = async () => {
    setPinSetupError("");
    if (!/^\d{4,6}$/.test(newPin)) {
      setPinSetupError(t("קוד PIN חייב להיות 4-6 ספרות", "PIN must be 4-6 digits"));
      return;
    }
    if (newPin !== confirmPin) {
      setPinSetupError(t("קודי ה-PIN לא תואמים", "PIN codes do not match"));
      return;
    }
    const success = await setParentalPin(newPin);
    if (success) {
      setHasPinSet(true);
      setIsSettingPin(false);
      setNewPin("");
      setConfirmPin("");
      toast({
        title: t("קוד PIN נקבע", "PIN code set"),
        description: t("ההגדרות מוגנות כעת בקוד PIN", "Settings are now protected with a PIN"),
        className: "bg-green-100 text-green-900 dark:bg-green-900/50 dark:text-green-100"
      });
    }
  };

  const handleRemovePin = async () => {
    const success = await removeParentalPin(removeConfirmPin);
    if (success) {
      setHasPinSet(false);
      setIsRemovingPin(false);
      setRemoveConfirmPin("");
      toast({
        title: t("קוד PIN הוסר", "PIN removed"),
        description: t("ההגדרות אינן מוגנות יותר בקוד PIN", "Settings are no longer PIN-protected"),
      });
    } else {
      toast({
        variant: "destructive",
        title: t("קוד PIN שגוי", "Wrong PIN"),
        description: t("הקוד שהוזן אינו נכון", "The PIN entered is incorrect"),
      });
      setRemoveConfirmPin("");
    }
  };

  // --- PIN unlock screen ---
  if (!isUnlocked) {
    return (
      <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
        <Card className="border-amber-200 dark:border-amber-800">
          <CardContent className="p-8">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Lock className="h-8 w-8 text-amber-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {t("בקרת הורים מוגנת", "Parental Controls Protected")}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t("הזן קוד PIN כדי לגשת להגדרות", "Enter PIN code to access settings")}
              </p>

              <div className="w-full max-w-[200px] space-y-3">
                <Input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder={t("קוד PIN", "PIN code")}
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value.replace(/\D/g, ''));
                    setPinError(false);
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handlePinUnlock()}
                  className={`text-center text-2xl tracking-[0.5em] ${pinError ? 'border-red-500' : ''}`}
                  aria-label={t("הזן קוד PIN", "Enter PIN code")}
                />
                {pinError && (
                  <p className="text-sm text-red-500" role="alert">
                    {t("קוד PIN שגוי", "Incorrect PIN")}
                  </p>
                )}
                <Button
                  onClick={handlePinUnlock}
                  disabled={pinInput.length < 4}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  <KeyRound className="h-4 w-4 ml-2" aria-hidden="true" />
                  {t("פתח", "Unlock")}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- Main controls (unlocked) ---
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
                  "הגדרות אלו מאפשרות לך לשלוט בתוכן שהילד שלך יכול ליצור ולצפות.",
                  "These settings let you control what content your child can create and view."
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PIN Management */}
      <Card>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse text-right" : ""}`}>
            <KeyRound className="h-5 w-5 text-indigo-600" />
            {t("הגנת קוד PIN", "PIN Code Protection")}
          </CardTitle>
          <CardDescription className={isRTL ? "text-right" : ""}>
            {hasPinSet
              ? t("ההגדרות מוגנות בקוד PIN", "Settings are protected with a PIN code")
              : t("הגדר קוד PIN כדי להגן על ההגדרות מפני שינוי על ידי ילדים", "Set a PIN code to protect settings from being changed by children")
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!hasPinSet && !isSettingPin && (
            <Button
              onClick={() => setIsSettingPin(true)}
              variant="outline"
              className="gap-2"
            >
              <Lock className="h-4 w-4" aria-hidden="true" />
              {t("הגדר קוד PIN", "Set PIN Code")}
            </Button>
          )}

          {isSettingPin && (
            <div className="space-y-3 max-w-xs">
              <div>
                <Label>{t("קוד PIN חדש (4-6 ספרות)", "New PIN (4-6 digits)")}</Label>
                <Input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="****"
                  className="text-center tracking-widest"
                  aria-label={t("קוד PIN חדש", "New PIN code")}
                />
              </div>
              <div>
                <Label>{t("אשר קוד PIN", "Confirm PIN")}</Label>
                <Input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="****"
                  className="text-center tracking-widest"
                  aria-label={t("אשר קוד PIN", "Confirm PIN")}
                />
              </div>
              {pinSetupError && (
                <p className="text-sm text-red-500" role="alert">{pinSetupError}</p>
              )}
              <div className="flex gap-2">
                <Button onClick={handleSetPin} className="bg-purple-600 hover:bg-purple-700 gap-1">
                  <Check className="h-4 w-4" aria-hidden="true" />
                  {t("שמור", "Save")}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setIsSettingPin(false);
                    setNewPin("");
                    setConfirmPin("");
                    setPinSetupError("");
                  }}
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                  {t("ביטול", "Cancel")}
                </Button>
              </div>
            </div>
          )}

          {hasPinSet && !isRemovingPin && (
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="border-green-300 text-green-700 dark:text-green-300 gap-1">
                <Check className="h-3 w-3" />
                {t("PIN פעיל", "PIN Active")}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsRemovingPin(true)}
                className="text-red-500 hover:text-red-700"
              >
                {t("הסר PIN", "Remove PIN")}
              </Button>
            </div>
          )}

          {isRemovingPin && (
            <div className="space-y-3 max-w-xs">
              <Label>{t("הזן קוד PIN הנוכחי כדי להסיר", "Enter current PIN to remove")}</Label>
              <Input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={removeConfirmPin}
                onChange={(e) => setRemoveConfirmPin(e.target.value.replace(/\D/g, ''))}
                placeholder="****"
                className="text-center tracking-widest"
                aria-label={t("קוד PIN נוכחי", "Current PIN")}
              />
              <div className="flex gap-2">
                <Button onClick={handleRemovePin} variant="destructive" size="sm" className="gap-1">
                  {t("הסר", "Remove")}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsRemovingPin(false);
                    setRemoveConfirmPin("");
                  }}
                >
                  {t("ביטול", "Cancel")}
                </Button>
              </div>
            </div>
          )}
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

// Badge component used above (inline since we only need it here)
function Badge({ children, variant = "default", className = "" }) {
  const baseClass = variant === "outline"
    ? "border rounded-full px-2 py-0.5 text-xs inline-flex items-center"
    : "rounded-full px-2 py-0.5 text-xs inline-flex items-center";
  return <span className={`${baseClass} ${className}`}>{children}</span>;
}
