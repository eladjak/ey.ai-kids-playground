import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SwitchButton from '../SwitchButton';

export default function NotificationSettings({
  settings,
  onSettingChange,
  currentLanguage = "english"
}) {
  const translations = {
    english: {
      title: "Notification Settings",
      emailNotifications: "Email Notifications",
      emailDesc: "Receive notifications via email",
      bookCompletion: "Book Completion",
      bookDesc: "Get notified when your book is ready",
      newFeatures: "New Features",
      featuresDesc: "Learn about new app features",
      collaboration: "Collaboration Updates",
      collabDesc: "Get updates about collaborative projects"
    },
    hebrew: {
      title: "הגדרות התראות",
      emailNotifications: "התראות במייל",
      emailDesc: "קבל התראות באמצעות דואר אלקטרוני",
      bookCompletion: "השלמת ספר",
      bookDesc: "קבל התראה כשהספר שלך מוכן",
      newFeatures: "תכונות חדשות",
      featuresDesc: "למד על תכונות חדשות באפליקציה",
      collaboration: "עדכוני שיתוף פעולה",
      collabDesc: "קבל עדכונים על פרויקטים משותפים"
    }
  };

  const t = (key) => translations[currentLanguage]?.[key] || translations.english[key];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
      </CardHeader>
      <CardContent className="switch-group">
        <SwitchButton
          id="email-notifications"
          label={t('emailNotifications')}
          description={t('emailDesc')}
          checked={settings.emailEnabled}
          onCheckedChange={(checked) => onSettingChange('emailEnabled', checked)}
        />
        
        <SwitchButton
          id="book-completion"
          label={t('bookCompletion')}
          description={t('bookDesc')}
          checked={settings.bookCompletionEnabled}
          onCheckedChange={(checked) => onSettingChange('bookCompletionEnabled', checked)}
          disabled={!settings.emailEnabled}
        />
        
        <SwitchButton
          id="new-features"
          label={t('newFeatures')}
          description={t('featuresDesc')}
          checked={settings.newFeaturesEnabled}
          onCheckedChange={(checked) => onSettingChange('newFeaturesEnabled', checked)}
          disabled={!settings.emailEnabled}
        />
        
        <SwitchButton
          id="collaboration"
          label={t('collaboration')}
          description={t('collabDesc')}
          checked={settings.collaborationEnabled}
          onCheckedChange={(checked) => onSettingChange('collaborationEnabled', checked)}
          disabled={!settings.emailEnabled}
        />
      </CardContent>
    </Card>
  );
}