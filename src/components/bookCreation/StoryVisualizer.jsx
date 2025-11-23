import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Maximize, 
  Download, 
  Share,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX
} from "lucide-react";

export default function StoryVisualizer({ book, pages = [], interactiveElements = [] }) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoPlaySpeed, setAutoPlaySpeed] = useState(5000); // 5 seconds per page
  const [currentLanguage, setCurrentLanguage] = useState("english");
  const [isRTL, setIsRTL] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  
  // Load language preference
  useEffect(() => {
    const storedLanguage = localStorage.getItem("appLanguage") || "english";
    setCurrentLanguage(storedLanguage);
    setIsRTL(storedLanguage === "hebrew" || storedLanguage === "yiddish");
    
    const handleLanguageChange = (e) => {
      const newLang = e.detail?.language || "english";
      setCurrentLanguage(newLang);
      setIsRTL(newLang === "hebrew" || newLang === "yiddish");
    };
    
    window.addEventListener('languageChanged', handleLanguageChange);
    
    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange);
    };
  }, []);
  
  // Translation dictionaries
  const translations = {
    english: {
      "visualizer.story-preview": "Story Preview",
      "visualizer.no-pages": "No pages to display yet. Create some content first!",
      "visualizer.page": "Page",
      "visualizer.no-text": "No text content for this page"
    },
    hebrew: {
      "visualizer.story-preview": "תצוגה מקדימה של הסיפור",
      "visualizer.no-pages": "אין עדיין עמודים להצגה. צור תוכן תחילה!",
      "visualizer.page": "עמוד",
      "visualizer.no-text": "אין תוכן טקסט לעמוד זה"
    }
  };
  
  // Translation function
  const t = (key) => {
    return translations[currentLanguage]?.[key] || translations.english[key] || key;
  };
  
  // Auto-play functionality
  useEffect(() => {
    let timer;
    if (isPlaying && pages.length > 0) {
      timer = setTimeout(() => {
        if (currentPage < pages.length - 1) {
          setCurrentPage(currentPage + 1);
        } else {
          setIsPlaying(false); // Stop at the end
        }
      }, autoPlaySpeed);
    }
    
    return () => clearTimeout(timer);
  }, [isPlaying, currentPage, pages.length, autoPlaySpeed]);
  
  // Handle page navigation
  const goToNextPage = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const goToPreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };
  
  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);
  };
  
  // Handle page-specific interactive elements
  const pageElements = interactiveElements.filter(
    element => element.pageIndex === currentPage
  );
  
  // Function to handle interactive element interactions
  const handleInteraction = (element) => {
    switch (element.type) {
      case "clickable-audio":
        if (audioEnabled && element.audioUrl) {
          const audio = new Audio(element.audioUrl);
          audio.play();
        }
        break;
      case "pop-up-text":
        // Implementation for popup text
        break;
      case "animation":
        // Implementation for animation
        break;
      default:
        break;
    }
  };
  
  const getCurrentPageContent = () => {
    if (pages.length === 0) {
      return (
        <div className="flex items-center justify-center p-8 h-full">
          <p className="text-gray-500 dark:text-gray-400 text-center">
            {t("visualizer.no-pages")}
          </p>
        </div>
      );
    }
    
    const page = pages[currentPage];
    if (!page) return null;
    
    return (
      <div className="relative h-full">
        {/* Background image or color */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundColor: page.background_color || "#f9fafb",
            backgroundImage: page.image_url ? `url(${page.image_url})` : "none"
          }}
        >
          {/* Overlay for text readability if needed */}
          {page.text_content && page.image_url && (
            <div className="absolute inset-0 bg-black/20"></div>
          )}
        </div>
        
        {/* Text content */}
        {page.text_content ? (
          <div className="relative z-10 p-6 h-full flex items-center justify-center">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 rounded-lg shadow-lg max-w-md">
              <p className={`text-lg ${isRTL ? "text-right" : "text-left"} text-gray-800 dark:text-gray-200`}>
                {page.text_content}
              </p>
            </div>
          </div>
        ) : (
          <div className="relative z-10 p-6 h-full flex items-center justify-center">
            <p className="text-white bg-black/50 p-3 rounded-lg">
              {t("visualizer.no-text")}
            </p>
          </div>
        )}
        
        {/* Interactive elements */}
        {pageElements.map((element) => (
          <div
            key={element.id}
            className="absolute z-20 cursor-pointer"
            style={{
              left: `${element.position.x}%`,
              top: `${element.position.y}%`,
              transform: "translate(-50%, -50%)"
            }}
            onClick={() => handleInteraction(element)}
          >
            {/* Element visualization based on type */}
            {element.type === "clickable-audio" && (
              <div className="p-2 bg-purple-500/80 text-white rounded-full hover:bg-purple-600/80 transition-colors">
                <Volume2 className="h-5 w-5" />
              </div>
            )}
            {/* Add other element type visualizations here */}
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span>{t("visualizer.story-preview")}</span>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleAudio}>
              {audioEnabled ? (
                <Volume2 className="h-4 w-4" />
              ) : (
                <VolumeX className="h-4 w-4" />
              )}
            </Button>
            <Button variant="ghost" size="icon">
              <Maximize className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-grow p-0 overflow-hidden">
        <div className="w-full h-full aspect-[4/3] bg-gray-100 dark:bg-gray-800 relative overflow-hidden rounded-md">
          {getCurrentPageContent()}
        </div>
      </CardContent>
      
      <CardFooter className="p-3 flex flex-col space-y-2">
        <div className="flex items-center justify-between w-full">
          <Button variant="ghost" size="sm" onClick={goToPreviousPage} disabled={currentPage === 0}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Prev
          </Button>
          
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" onClick={goToPreviousPage} disabled={currentPage === 0} className="h-7 w-7">
              <SkipBack className="h-3 w-3" />
            </Button>
            
            <Button 
              variant="outline" 
              size="icon" 
              onClick={togglePlayback}
              className="h-8 w-8"
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
            
            <Button variant="outline" size="icon" onClick={goToNextPage} disabled={currentPage === pages.length - 1} className="h-7 w-7">
              <SkipForward className="h-3 w-3" />
            </Button>
          </div>
          
          <Button variant="ghost" size="sm" onClick={goToNextPage} disabled={currentPage === pages.length - 1}>
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
        
        <div className="w-full text-center text-xs text-gray-500 dark:text-gray-400">
          {pages.length > 0 ? (
            <span>
              {t("visualizer.page")} {currentPage + 1} / {pages.length}
            </span>
          ) : (
            <span>No pages</span>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}