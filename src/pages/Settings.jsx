
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useI18n } from '@/components/i18n/i18nProvider';
import { useToast } from '@/components/ui/use-toast';
import { User } from '@/entities/User';
import { useCurrentUser } from '@/hooks/useCurrentUser';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
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
import { PLANS, openCheckout } from '@/lib/polar';
import useSubscription from '@/hooks/useSubscription';
import { Badge } from '@/components/ui/badge';
import { Check, Crown } from 'lucide-react';

export default function Settings() {
  const { t, language, isRTL } = useI18n();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const { user: hookUser } = useCurrentUser();
  const { plan: currentPlan, refetch: refetchSubscription } = useSubscription();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
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

  // Handle checkout success redirect from Polar
  useEffect(() => {
    const checkoutStatus = searchParams.get('checkout');
    const upgradedPlan = searchParams.get('plan');

    if (checkoutStatus === 'success') {
      toast({
        title: isRTL ? 'שדרוג הצליח!' : 'Upgrade Successful!',
        description: isRTL
          ? `ברכות! שודרגת לתוכנית ${upgradedPlan || 'פרימיום'}`
          : `Congratulations! You've been upgraded to the ${upgradedPlan || 'premium'} plan.`,
      });
      refetchSubscription();

      // Remove query params from URL without reload
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [searchParams, refetchSubscription, toast, isRTL]);

  useEffect(() => {
    loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hookUser]);

  const loadSettings = () => {
    try {
      setIsLoading(true);
      const currentUser = hookUser;
      if (!currentUser) {
        setIsLoading(false);
        return;
      }
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
      toast({
        variant: "destructive",
        title: isRTL ? "שגיאה בטעינת הגדרות" : "Failed to load settings",
        description: isRTL ? "לא ניתן לטעון את ההגדרות שלך. נסה לרענן את הדף." : "Could not load your settings. Please try refreshing the page.",
      });
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
      if (tempSettings.language !== language) {
        localStorage.setItem("language", tempSettings.language);
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
      
      toast({
        title: isRTL ? "ההגדרות נשמרו" : "Settings saved",
        description: isRTL ? "ההגדרות שלך עודכנו בהצלחה." : "Your settings have been updated successfully.",
        className: "bg-green-100 text-green-900 dark:bg-green-900/50 dark:text-green-100",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: isRTL ? "שגיאה בשמירת הגדרות" : "Failed to save settings",
        description: isRTL ? "לא ניתן לשמור את ההגדרות. נסה שוב." : "Could not save your settings. Please try again.",
      });
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

  const logoutLabel = isRTL ? "יציאה מהחשבון" : "Log out";
  const logoutConfirmTitle = isRTL ? "האם אתה בטוח?" : "Are you sure you want to log out?";
  const logoutConfirmDesc = isRTL
    ? "תצא מהחשבון שלך. תוכל להתחבר מחדש בכל עת."
    : "You will be signed out of your account. You can sign back in at any time.";
  const cancelLabel = isRTL ? "ביטול" : "Cancel";
  const confirmLabel = isRTL ? "יציאה" : "Log out";

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
                      <SelectItem value="english">{t("bookWizard.languageEnglish")}</SelectItem>
                      <SelectItem value="hebrew">{t("bookWizard.languageHebrew")}</SelectItem>
                      <SelectItem value="yiddish">{t("bookWizard.languageYiddish")}</SelectItem>
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
                      <SelectItem value="english">{t("bookWizard.languageEnglish")}</SelectItem>
                      <SelectItem value="hebrew">{t("bookWizard.languageHebrew")}</SelectItem>
                      <SelectItem value="yiddish">{t("bookWizard.languageYiddish")}</SelectItem>
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
                      <SelectItem value="0.75">{t("settings.accessibility.audioSpeeds.slow")}</SelectItem>
                      <SelectItem value="1">{t("settings.accessibility.audioSpeeds.normal")}</SelectItem>
                      <SelectItem value="1.25">{t("settings.accessibility.audioSpeeds.fast")}</SelectItem>
                      <SelectItem value="1.5">{t("settings.accessibility.audioSpeeds.veryFast")}</SelectItem>
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
            userTier={user?.tier || user?.subscription_tier || "free"}
            credits={{ used: user?.credits_used ?? 0, total: user?.credits_total ?? 100 }}
            currentLanguage={language}
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
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                        <LogOut className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4`} />
                        {t("settings.account.logout")}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent dir={isRTL ? "rtl" : "ltr"}>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{logoutConfirmTitle}</AlertDialogTitle>
                        <AlertDialogDescription>{logoutConfirmDesc}</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className={isRTL ? "flex-row-reverse" : ""}>
                        <AlertDialogCancel>{cancelLabel}</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleLogout}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          {confirmLabel}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
               </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="billing">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}>
                  <CreditCard className="h-5 w-5 text-purple-500" />
                  {isRTL ? 'מנוי נוכחי' : 'Current Plan'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                  <Badge variant="secondary" className="text-sm px-3 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                    {PLANS[currentPlan]?.name[isRTL ? 'he' : 'en'] || 'Free'}
                  </Badge>
                  {currentPlan !== 'free' && (
                    <span className="text-sm text-gray-500">
                      {PLANS[currentPlan]?.price[isRTL ? 'he' : 'en']}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-3 gap-6">
              {Object.values(PLANS).map((planDef) => {
                const isCurrent = currentPlan === planDef.id;
                const lang = isRTL ? 'he' : 'en';

                return (
                  <Card
                    key={planDef.id}
                    className={`relative overflow-hidden transition-shadow ${
                      planDef.popular
                        ? 'border-2 border-purple-500 shadow-lg shadow-purple-100 dark:shadow-purple-900/20'
                        : ''
                    } ${isCurrent ? 'ring-2 ring-green-500' : ''}`}
                  >
                    {planDef.popular && (
                      <div className="absolute top-0 left-0 right-0 bg-purple-600 text-white text-center text-xs py-1 font-medium">
                        {isRTL ? 'הכי פופולרי' : 'Most Popular'}
                      </div>
                    )}
                    <CardHeader className={planDef.popular ? 'pt-8' : ''}>
                      <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}>
                        {planDef.id !== 'free' && <Crown className="h-5 w-5 text-purple-500" />}
                        {planDef.name[lang]}
                      </CardTitle>
                      <div className={`text-2xl font-bold text-purple-700 dark:text-purple-300 ${isRTL ? 'text-right' : 'text-left'}`}>
                        {planDef.price[lang]}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ul className="space-y-2">
                        {planDef.features[lang].map((feature, i) => (
                          <li
                            key={i}
                            className={`flex items-center gap-2 text-sm ${isRTL ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}
                          >
                            <Check className="h-4 w-4 text-green-500 shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>

                      {isCurrent ? (
                        <Button variant="outline" className="w-full" disabled>
                          <Check className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                          {isRTL ? 'המנוי הנוכחי' : 'Current Plan'}
                        </Button>
                      ) : planDef.id === 'free' ? (
                        <Button variant="outline" className="w-full" disabled>
                          {isRTL ? 'חינמי' : 'Free'}
                        </Button>
                      ) : (
                        <Button
                          className={`w-full ${planDef.popular ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
                          onClick={() => openCheckout(planDef.id, user?.email)}
                        >
                          <Crown className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                          {isRTL ? 'שדרג עכשיו' : 'Upgrade Now'}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="parental">
          <ParentalControls
            currentLanguage={language}
            isRTL={isRTL}
          />
        </TabsContent>

      </Tabs>
    </div>
  );
}
