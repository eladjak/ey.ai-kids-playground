
import React, { useState, useEffect } from 'react';
import { User } from '@/entities/User';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Settings as SettingsIcon,
  User as UserIcon,
  Palette,
  Globe,
  Volume2,
  Sparkles,
  CreditCard,
  Shield,
  Bell,
  Loader2,
  LogOut
} from 'lucide-react';
import AIStudio from '../components/ai/AIStudio';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import ParentalControls from '../components/settings/ParentalControls';

export default function Settings() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState("english");
  const [isRTL, setIsRTL] = useState(false);
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState({
    language: "english",
    dark_mode: false,
    text_density: "medium",
    font_size: "medium",
    notifications_enabled: true,
    audio_enabled: true,
    audio_speed: "1",
    default_story_language: "english"
  });
  const [tempSettings, setTempSettings] = useState({});

  const translations = {
    english: {
      "settings.title": "Settings",
      "settings.subtitle": "Manage your preferences and account settings",
      "settings.tabs.general": "General",
      "settings.tabs.appearance": "Appearance",
      "settings.tabs.ai": "AI Studio",
      "settings.tabs.account": "Account",
      "settings.tabs.billing": "Billing",
      "settings.language": "Interface Language",
      "settings.defaultStoryLanguage": "Default Story Language",
      "settings.notifications": "Notifications",
      "settings.audio": "Audio Settings",
      "settings.audioEnabled": "Enable Audio Narration",
      "settings.audioSpeed": "Narration Speed",
      "settings.appearance.title": "Appearance",
      "settings.appearance.desc": "Customize how the app looks and feels.",
      "settings.darkMode": "Dark Mode",
      "settings.textDensity": "Text Density",
      "settings.fontSize": "Font Size",
      "settings.appearance.density.low": "Low",
      "settings.appearance.density.medium": "Medium",
      "settings.appearance.density.high": "High",
      "settings.appearance.fontSize.small": "Small",
      "settings.appearance.fontSize.medium": "Medium",
      "settings.appearance.fontSize.large": "Large",
      "settings.appearance.fontSize.xLarge": "Extra Large",
      "settings.ai.title": "AI Preferences",
      "settings.ai.description": "Configure your AI models and generation preferences",
      "settings.save": "Save Changes",
      "settings.saving": "Saving...",
      "settings.saved": "Settings saved successfully",
      "settings.account.title": "Account Information",
      "settings.account.desc": "View and manage your account details.",
      "settings.account.name": "Full Name",
      "settings.account.email": "Email Address",
      "settings.account.manageSub": "Manage Subscription",
      "settings.account.logout": "Logout",
      "settings.billing.title": "Billing & Subscription",
      "settings.billing.desc": "View your current plan, usage, and billing history.",
      "settings.billing.comingSoon": "Billing management is coming soon.",
      "settings.billing.upgradePlan": "Upgrade Plan",
      "settings.general.languageSettings": "Language Settings",
      "settings.notification.enable": "Enable notifications for new features and updates",
      "settings.loading": "Loading settings...",
      "settings.tabs.parental": "Parental Controls"
    },
    hebrew: {
      "settings.title": "הגדרות",
      "settings.subtitle": "נהל את ההעדפות והגדרות החשבון שלך",
      "settings.tabs.general": "כללי",
      "settings.tabs.appearance": "מראה",
      "settings.tabs.ai": "סטודיו AI",
      "settings.tabs.account": "חשבון",
      "settings.tabs.billing": "חיוב",
      "settings.language": "שפת הממשק",
      "settings.defaultStoryLanguage": "שפת ברירת מחדל לסיפורים",
      "settings.notifications": "התראות",
      "settings.audio": "הגדרות אודיו",
      "settings.audioEnabled": "הפעל קריינות אודיו",
      "settings.audioSpeed": "מהירות קריינות",
      "settings.appearance.title": "מראה",
      "settings.appearance.desc": "התאם את מראה האפליקציה לפי הטעם שלך.",
      "settings.darkMode": "מצב כהה",
      "settings.textDensity": "צפיפות טקסט",
      "settings.fontSize": "גודל גופן",
      "settings.appearance.density.low": "נמוכה",
      "settings.appearance.density.medium": "בינונית",
      "settings.appearance.density.high": "גבוהה",
      "settings.appearance.fontSize.small": "קטן",
      "settings.appearance.fontSize.medium": "בינוני",
      "settings.appearance.fontSize.large": "גדול",
      "settings.appearance.fontSize.xLarge": "גדול מאוד",
      "settings.ai.title": "העדפות AI",
      "settings.ai.description": "הגדר את מודלי ה-AI והעדפות היצירה שלך",
      "settings.save": "שמור שינויים",
      "settings.saving": "שומר...",
      "settings.saved": "ההגדרות נשמרו בהצלחה",
      "settings.account.title": "פרטי חשבון",
      "settings.account.desc": "צפה ונהל את פרטי החשבון שלך.",
      "settings.account.name": "שם מלא",
      "settings.account.email": "כתובת אימייל",
      "settings.account.manageSub": "נהל מנוי",
      "settings.account.logout": "התנתק",
      "settings.billing.title": "חיובים ומנוי",
      "settings.billing.desc": "צפה בחבילה הנוכחית, שימוש, והיסטוריית חיובים.",
      "settings.billing.comingSoon": "ניהול חיובים יתווסף בקרוב.",
      "settings.billing.upgradePlan": "שדרג חבילה",
      "settings.general.languageSettings": "הגדרות שפה",
      "settings.notification.enable": "אפשר התראות על פיצ'רים חדשים ועדכונים",
      "settings.loading": "טוען הגדרות...",
      "settings.tabs.parental": "בקרת הורים"
    }
  };

  const t = (key) => {
    return translations[currentLanguage]?.[key] || translations.english[key] || key;
  };

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    const storedLanguage = localStorage.getItem("appLanguage") || "english";
    setCurrentLanguage(storedLanguage);
    setIsRTL(storedLanguage === "hebrew");
  }, [currentLanguage]); // Add currentLanguage to dependency array to re-evaluate isRTL if language changes

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const currentUser = await User.me();
      setUser(currentUser);
      
      const settings = {
        language: currentUser.language || "english",
        dark_mode: currentUser.dark_mode || false,
        text_density: currentUser.text_density || "medium",
        font_size: currentUser.font_size || "medium",
        notifications_enabled: currentUser.notifications_enabled !== false,
        audio_enabled: currentUser.audio_enabled !== false,
        audio_speed: currentUser.audio_speed || "1",
        default_story_language: currentUser.default_story_language || "english"
      };
      
      setUserData(settings);
      setTempSettings(settings);
    } catch (error) {
      // silently handled
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setIsSaving(true);
      
      await User.updateMyUserData(tempSettings);
      
      setUserData(tempSettings);
      
      // Update app language if changed
      if (tempSettings.language !== currentLanguage) {
        localStorage.setItem("appLanguage", tempSettings.language);
        window.location.reload(); // Reload to apply language change
      }
      
      // Update dark mode if changed
      if (tempSettings.dark_mode !== userData.dark_mode) {
        localStorage.setItem("darkMode", tempSettings.dark_mode.toString());
        if (tempSettings.dark_mode) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
      
    } catch (error) {
      // silently handled
    } finally {
      setIsSaving(false);
    }
  };

  const updateTempSetting = (key, value) => {
    setTempSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleLogout = async () => {
    await User.logout();
    window.location.href = "/";
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]" dir={isRTL ? "rtl" : "ltr"}>
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">
            {t("settings.loading")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : 'flex-row'} justify-between`}>
        <div className={isRTL ? "text-right" : "text-left"}>
          <h1 className={`text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
            <SettingsIcon className="h-8 w-8 text-purple-600" />
            {t("settings.title")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            {t("settings.subtitle")}
          </p>
        </div>
        
        <Button 
          onClick={saveSettings} 
          disabled={isSaving}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {isSaving ? (
            <>
              <Loader2 className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4 animate-spin`} />
              {t("settings.saving")}
            </>
          ) : (
            t("settings.save")
          )}
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className={`bg-white dark:bg-gray-800 p-1 rounded-lg shadow-sm border ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
          <TabsTrigger value="general" className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
            <SettingsIcon className="h-4 w-4" />
            {t("settings.tabs.general")}
          </TabsTrigger>
          <TabsTrigger value="appearance" className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
            <Palette className="h-4 w-4" />
            {t("settings.tabs.appearance")}
          </TabsTrigger>
          <TabsTrigger value="ai" className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
            <Sparkles className="h-4 w-4" />
            {t("settings.tabs.ai")}
          </TabsTrigger>
          <TabsTrigger value="account" className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
            <UserIcon className="h-4 w-4" />
            {t("settings.tabs.account")}
          </TabsTrigger>
           <TabsTrigger value="billing" className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
            <CreditCard className="h-4 w-4" />
            {t("settings.tabs.billing")}
          </TabsTrigger>
          <TabsTrigger value="parental" className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
            <Shield className="h-4 w-4" />
            {t("settings.tabs.parental")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}>
                  <Globe className="h-5 w-5 text-blue-500" />
                  {t("settings.general.languageSettings")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className={isRTL ? "text-right" : "text-left"}>{t("settings.language")}</Label>
                  <Select
                    value={tempSettings.language}
                    onValueChange={(value) => updateTempSetting("language", value)}
                  >
                    <SelectTrigger className={isRTL ? "text-right" : "text-left"}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="hebrew">עברית</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className={isRTL ? "text-right" : "text-left"}>{t("settings.defaultStoryLanguage")}</Label>
                  <Select
                    value={tempSettings.default_story_language}
                    onValueChange={(value) => updateTempSetting("default_story_language", value)}
                  >
                    <SelectTrigger className={isRTL ? "text-right" : "text-left"}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="hebrew">עברית</SelectItem>
                      <SelectItem value="yiddish">ייִדיש</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}>
                  <Volume2 className="h-5 w-5 text-green-500" />
                  {t("settings.audio")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : 'flex-row'} justify-between`}>
                  <Label className={isRTL ? "text-right" : "text-left"}>{t("settings.audioEnabled")}</Label>
                  <Switch
                    checked={tempSettings.audio_enabled}
                    onCheckedChange={(checked) => updateTempSetting("audio_enabled", checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className={isRTL ? "text-right" : "text-left"}>{t("settings.audioSpeed")}</Label>
                  <Select
                    value={tempSettings.audio_speed}
                    onValueChange={(value) => updateTempSetting("audio_speed", value)}
                  >
                    <SelectTrigger className={isRTL ? "text-right" : "text-left"}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.75">0.75x</SelectItem>
                      <SelectItem value="1">1x (Normal)</SelectItem>
                      <SelectItem value="1.25">1.25x</SelectItem>
                      <SelectItem value="1.5">1.5x</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}>
                  <Bell className="h-5 w-5 text-orange-500" />
                  {t("settings.notifications")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : 'flex-row'} justify-between`}>
                  <Label className={isRTL ? "text-right" : "text-left"}>
                    {t("settings.notification.enable")}
                  </Label>
                  <Switch
                    checked={tempSettings.notifications_enabled}
                    onCheckedChange={(checked) => updateTempSetting("notifications_enabled", checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle className={isRTL ? "text-right" : "text-left"}>{t("settings.appearance.title")}</CardTitle>
              <CardDescription className={isRTL ? "text-right" : "text-left"}>
                {t("settings.appearance.desc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : 'flex-row'} justify-between`}>
                <Label className={isRTL ? "text-right" : "text-left"}>{t("settings.darkMode")}</Label>
                <Switch
                  checked={tempSettings.dark_mode}
                  onCheckedChange={(checked) => updateTempSetting("dark_mode", checked)}
                />
              </div>

              <div className="space-y-2">
                <Label className={isRTL ? "text-right" : "text-left"}>{t("settings.textDensity")}</Label>
                <Select
                  value={tempSettings.text_density}
                  onValueChange={(value) => updateTempSetting("text_density", value)}
                >
                  <SelectTrigger className={isRTL ? "text-right" : "text-left"}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">{t("settings.appearance.density.low")}</SelectItem>
                    <SelectItem value="medium">{t("settings.appearance.density.medium")}</SelectItem>
                    <SelectItem value="high">{t("settings.appearance.density.high")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className={isRTL ? "text-right" : "text-left"}>{t("settings.fontSize")}</Label>
                <Select
                  value={tempSettings.font_size}
                  onValueChange={(value) => updateTempSetting("font_size", value)}
                >
                  <SelectTrigger className={isRTL ? "text-right" : "text-left"}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">{t("settings.appearance.fontSize.small")}</SelectItem>
                    <SelectItem value="medium">{t("settings.appearance.fontSize.medium")}</SelectItem>
                    <SelectItem value="large">{t("settings.appearance.fontSize.large")}</SelectItem>
                    <SelectItem value="x-large">{t("settings.appearance.fontSize.xLarge")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai">
          <AIStudio
            currentModel={null}
            onModelChange={() => {}}
            userTier="premium" // For developer, access to all models
            credits={{ used: 25, total: 1000 }} // High credits for testing
            currentLanguage={currentLanguage}
          />
        </TabsContent>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}>
                <UserIcon className="h-5 w-5 text-gray-500" />
                {t("settings.account.title")}
              </CardTitle>
              <CardDescription className={isRTL ? "text-right" : "text-left"}>{t("settings.account.desc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                <Avatar className="h-16 w-16">
                   <AvatarImage src={user?.avatar_url} />
                   <AvatarFallback>{user?.full_name?.[0] || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div>
                    <Label htmlFor="fullName" className={isRTL ? "text-right" : "text-left"}>{t("settings.account.name")}</Label>
                    <Input id="fullName" value={user?.full_name || ''} readOnly className={isRTL ? "text-right" : "text-left"} />
                  </div>
                   <div>
                    <Label htmlFor="email" className={isRTL ? "text-right" : "text-left"}>{t("settings.account.email")}</Label>
                    <Input id="email" value={user?.email || ''} readOnly className={isRTL ? "text-right" : "text-left"} />
                  </div>
                </div>
              </div>
               <div className={`flex ${isRTL ? 'flex-row-reverse' : 'flex-row'} justify-between items-center pt-4 border-t`}>
                  <Button variant="outline" disabled>
                    <CreditCard className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4`} />
                    {t("settings.account.manageSub")}
                  </Button>
                  <Button variant="destructive" onClick={handleLogout}>
                     <LogOut className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4`} />
                    {t("settings.account.logout")}
                  </Button>
               </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="billing">
           <Card>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}>
                <CreditCard className="h-5 w-5 text-gray-500" />
                 {t("settings.billing.title")}
              </CardTitle>
              <CardDescription className={isRTL ? "text-right" : "text-left"}>{t("settings.billing.desc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">{t("settings.billing.comingSoon")}</p>
                 <Button variant="default" className="mt-4" disabled>
                   {t("settings.billing.upgradePlan")}
                 </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="parental">
          <ParentalControls
            currentLanguage={currentLanguage}
            isRTL={isRTL}
          />
        </TabsContent>

      </Tabs>
    </div>
  );
}
