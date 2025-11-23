import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Check, X } from "lucide-react";

export default function EditProfileDialog({ 
  open, 
  onOpenChange, 
  userData, 
  onSave, 
  isSaving = false, 
  currentLanguage = "english" 
}) {
  const [formData, setFormData] = useState(userData || {
    display_name: "",
    bio: "",
    language: currentLanguage,
    interests: []
  });

  const translations = {
    english: {
      "profile.editProfile": "Edit Profile",
      "profile.personalInfo": "Personal Information",
      "profile.displayName": "Display Name",
      "profile.bio": "Bio",
      "profile.interests": "Interests",
      "profile.language": "Interface Language",
      "profile.save": "Save Changes",
      "profile.cancel": "Cancel",
      "profile.saving": "Saving...",
      "language.english": "English",
      "language.hebrew": "Hebrew",
      "interests.placeholder": "What are you interested in? (comma separated)"
    },
    hebrew: {
      "profile.editProfile": "עריכת פרופיל",
      "profile.personalInfo": "מידע אישי",
      "profile.displayName": "שם תצוגה",
      "profile.bio": "ביוגרפיה",
      "profile.interests": "תחומי עניין",
      "profile.language": "שפת ממשק",
      "profile.save": "שמור שינויים",
      "profile.cancel": "ביטול",
      "profile.saving": "שומר...",
      "language.english": "אנגלית",
      "language.hebrew": "עברית",
      "interests.placeholder": "במה אתה מתעניין? (מופרד בפסיקים)"
    }
  };

  const t = (key) => translations[currentLanguage]?.[key] || translations.english[key];
  const isRTL = currentLanguage === "hebrew";

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" dir={isRTL ? "rtl" : "ltr"}>
        <DialogHeader>
          <DialogTitle>{t("profile.editProfile")}</DialogTitle>
          <DialogDescription>{t("profile.personalInfo")}</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">{t("profile.displayName")}</Label>
            <Input 
              id="displayName" 
              value={formData.display_name}
              onChange={(e) => handleInputChange("display_name", e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bio">{t("profile.bio")}</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange("bio", e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="interests">{t("profile.interests")}</Label>
            <Input
              id="interests"
              value={formData.interests}
              onChange={(e) => handleInputChange("interests", e.target.value)}
              placeholder={t("interests.placeholder")}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="language">{t("profile.language")}</Label>
            <Select
              value={formData.language || currentLanguage}
              onValueChange={(value) => handleInputChange("language", value)}
            >
              <SelectTrigger id="language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="english">{t("language.english")}</SelectItem>
                <SelectItem value="hebrew">{t("language.hebrew")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="gap-1"
          >
            <X className="h-4 w-4" />
            {t("profile.cancel")}
          </Button>
          
          <Button 
            onClick={handleSubmit} 
            disabled={isSaving}
            className="gap-1"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("profile.saving")}
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                {t("profile.save")}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}