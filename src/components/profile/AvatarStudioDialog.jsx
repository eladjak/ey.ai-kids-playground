import React from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import AvatarStudio from './AvatarStudio';

export default function AvatarStudioDialog({ 
  open, 
  onOpenChange, 
  currentAvatar, 
  onAvatarSelected, 
  currentLanguage 
}) {
  const translations = {
    english: {
      "avatar.title": "Choose Your Avatar",
      "avatar.description": "Select or create an avatar that represents you"
    },
    hebrew: {
      "avatar.title": "בחר את האווטאר שלך",
      "avatar.description": "בחר או צור אווטאר שמייצג אותך"
    }
  };

  const t = (key) => translations[currentLanguage]?.[key] || translations.english[key];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{t("avatar.title")}</DialogTitle>
          <DialogDescription>{t("avatar.description")}</DialogDescription>
        </DialogHeader>
        <AvatarStudio
          currentAvatar={currentAvatar}
          onAvatarSelected={onAvatarSelected}
          onClose={() => onOpenChange(false)}
          currentLanguage={currentLanguage}
        />
      </DialogContent>
    </Dialog>
  );
}