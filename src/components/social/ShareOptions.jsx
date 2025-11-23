import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Share2,
  Copy,
  Facebook,
  Twitter,
  Mail,
  Link as LinkIcon,
  Check,
  Trophy,
  Users,
  MessageSquare,
  BookOpen
} from "lucide-react";

export default function ShareOptions({
  bookId,
  bookTitle,
  bookCover,
  onShare,
  currentLanguage = "english",
  isRTL = false
}) {
  const [copied, setCopied] = useState(false);
  const [shareText, setShareText] = useState("");
  const [includeImage, setIncludeImage] = useState(true);
  const [includeLink, setIncludeLink] = useState(true);
  const [isPublic, setIsPublic] = useState(true);
  
  // Generate share link
  const shareLink = `https://eyai-kids.example.com/books/${bookId}`;
  
  // Translations
  const translations = {
    english: {
      title: "Share Your Story",
      subtitle: "Share your personalized story with friends and family",
      tabs: {
        social: "Social Media",
        community: "Community",
        link: "Get Link"
      },
      messageLabel: "Share Message",
      messagePlaceholder: "Check out this amazing personalized book I created!",
      includeImage: "Include Cover Image",
      includeLink: "Include Link",
      copyButton: "Copy Link",
      copied: "Copied!",
      shareToFacebook: "Share to Facebook",
      shareToTwitter: "Share to Twitter",
      shareByEmail: "Share by Email",
      communityTitle: "Share to Community",
      communityDescription: "Share your book to inspire others in the EY.AI Kids community",
      makePublic: "Make book public in community",
      privateNote: "Only you can see private books",
      tags: "Tags",
      tagsPlaceholder: "adventure, fantasy, dragons...",
      shareButton: "Share Book",
      achievements: {
        title: "Earn Achievements",
        first: "First Share",
        popular: "Popular Story",
        featured: "Featured Creation"
      }
    },
    hebrew: {
      title: "שתף את הסיפור שלך",
      subtitle: "שתף את הסיפור המותאם אישית שלך עם חברים ומשפחה",
      tabs: {
        social: "מדיה חברתית",
        community: "קהילה",
        link: "קבל קישור"
      },
      messageLabel: "הודעת שיתוף",
      messagePlaceholder: "בדוק את הספר המותאם אישית המדהים הזה שיצרתי!",
      includeImage: "כלול תמונת כריכה",
      includeLink: "כלול קישור",
      copyButton: "העתק קישור",
      copied: "הועתק!",
      shareToFacebook: "שתף בפייסבוק",
      shareToTwitter: "שתף בטוויטר",
      shareByEmail: "שתף באימייל",
      communityTitle: "שתף בקהילה",
      communityDescription: "שתף את הספר שלך כדי להשראה לאחרים בקהילת EY.AI Kids",
      makePublic: "הפוך לציבורי בקהילה",
      privateNote: "רק אתה יכול לראות ספרים פרטיים",
      tags: "תגיות",
      tagsPlaceholder: "הרפתקאות, פנטזיה, דרקונים...",
      shareButton: "שתף ספר",
      achievements: {
        title: "צבור הישגים",
        first: "שיתוף ראשון",
        popular: "סיפור פופולרי",
        featured: "יצירה מוצגת"
      }
    }
  };

  // Translation helper
  const t = (key) => {
    const [section, subsection, item] = key.split(".");
    if (subsection && item) {
      return translations[currentLanguage]?.[subsection]?.[item] || 
             translations.english[subsection][item];
    } else if (subsection) {
      return translations[currentLanguage]?.[subsection] || 
             translations.english[subsection];
    }
    return translations[currentLanguage]?.[key] || translations.english[key] || key;
  };

  // Handle copy link to clipboard
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Handle social media sharing
  const handleSocialShare = (platform) => {
    let shareUrl;
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}&quote=${encodeURIComponent(shareText || t('messagePlaceholder'))}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent((shareText || t('messagePlaceholder')) + ' ' + shareLink)}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent(bookTitle)}&body=${encodeURIComponent((shareText || t('messagePlaceholder')) + '\n\n' + shareLink)}`;
        break;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank');
    
    // Call the onShare callback if provided
    if (onShare) {
      onShare(platform);
    }
  };

  return (
    <Card className="shadow-md" dir={isRTL ? "rtl" : "ltr"}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl text-gray-900 dark:text-white">
              {t("title")}
            </CardTitle>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              {t("subtitle")}
            </p>
          </div>
          <Share2 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="social" className="mb-4">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="social">
              <MessageSquare className="h-4 w-4 mr-2" />
              {t("tabs.social")}
            </TabsTrigger>
            <TabsTrigger value="community">
              <Users className="h-4 w-4 mr-2" />
              {t("tabs.community")}
            </TabsTrigger>
            <TabsTrigger value="link">
              <LinkIcon className="h-4 w-4 mr-2" />
              {t("tabs.link")}
            </TabsTrigger>
          </TabsList>
          
          {/* Social Media Tab */}
          <TabsContent value="social">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="share-message">{t("messageLabel")}</Label>
                <Textarea
                  id="share-message"
                  placeholder={t("messagePlaceholder")}
                  value={shareText}
                  onChange={(e) => setShareText(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
              
              <div className="flex items-center space-x-3">
                <Checkbox 
                  id="include-image" 
                  checked={includeImage}
                  onCheckedChange={setIncludeImage}
                />
                <Label htmlFor="include-image">{t("includeImage")}</Label>
              </div>
              
              <div className="flex items-center space-x-3">
                <Checkbox 
                  id="include-link" 
                  checked={includeLink}
                  onCheckedChange={setIncludeLink}
                />
                <Label htmlFor="include-link">{t("includeLink")}</Label>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => handleSocialShare('facebook')}
                >
                  <Facebook className="h-4 w-4 mr-2 text-blue-600" />
                  {t("shareToFacebook")}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => handleSocialShare('twitter')}
                >
                  <Twitter className="h-4 w-4 mr-2 text-blue-400" />
                  {t("shareToTwitter")}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => handleSocialShare('email')}
                >
                  <Mail className="h-4 w-4 mr-2 text-amber-500" />
                  {t("shareByEmail")}
                </Button>
              </div>
            </div>
          </TabsContent>
          
          {/* Community Tab */}
          <TabsContent value="community">
            <div className="space-y-6">
              {bookCover && (
                <div className="flex justify-center mb-4">
                  <div className="w-40 h-40 relative">
                    <img 
                      src={bookCover} 
                      alt={bookTitle} 
                      className="w-full h-full object-cover rounded-md shadow-sm"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-md"></div>
                    <BookOpen className="absolute bottom-2 right-2 h-6 w-6 text-white" />
                  </div>
                </div>
              )}
              
              <div>
                <h3 className="text-lg font-medium mb-1">{t("communityTitle")}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  {t("communityDescription")}
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <Switch 
                  id="public-toggle" 
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                />
                <div className="grid gap-1.5">
                  <Label htmlFor="public-toggle">{t("makePublic")}</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t("privateNote")}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tags">{t("tags")}</Label>
                <Input
                  id="tags"
                  placeholder={t("tagsPlaceholder")}
                />
              </div>
              
              <Button 
                className="w-full bg-purple-600 hover:bg-purple-700"
                onClick={() => onShare && onShare('community')}
              >
                <Share2 className="h-4 w-4 mr-2" />
                {t("shareButton")}
              </Button>
              
              {/* Achievements Section */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mt-4">
                <h4 className="font-medium mb-3 flex items-center">
                  <Trophy className="h-4 w-4 text-amber-500 mr-2" />
                  {t("achievements.title")}
                </h4>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-md bg-white dark:bg-gray-800 p-2 shadow-sm">
                    <div className="bg-blue-100 dark:bg-blue-900/30 w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Share2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <p className="text-xs">{t("achievements.first")}</p>
                  </div>
                  <div className="rounded-md bg-white dark:bg-gray-800 p-2 shadow-sm">
                    <div className="bg-purple-100 dark:bg-purple-900/30 w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <p className="text-xs">{t("achievements.popular")}</p>
                  </div>
                  <div className="rounded-md bg-white dark:bg-gray-800 p-2 shadow-sm">
                    <div className="bg-amber-100 dark:bg-amber-900/30 w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Trophy className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <p className="text-xs">{t("achievements.featured")}</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Link Tab */}
          <TabsContent value="link">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={shareLink}
                  className="font-mono text-sm"
                />
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={handleCopyLink}
                  className="flex-shrink-0"
                >
                  {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              
              <Button 
                className="w-full" 
                onClick={handleCopyLink}
              >
                {copied ? t("copied") : t("copyButton")}
              </Button>
              
              {bookCover && (
                <div className="flex justify-center mt-4">
                  <div className="w-48 h-48 relative rounded-md overflow-hidden shadow-md">
                    <img 
                      src={bookCover} 
                      alt={bookTitle} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm py-1 px-2 rounded text-sm font-medium">
                        {bookTitle}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}