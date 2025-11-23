import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
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
  VolumeX,
  Book,
  ListOrdered,
  Users,
  Map,
  Award,
  LineChart,
  Layers
} from "lucide-react";

export default function StoryVisualizer({ 
  book, 
  pages = [], 
  currentLanguage = "english",
  isRTL = false 
}) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoPlaySpeed, setAutoPlaySpeed] = useState(5000);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState("pages");
  const [showFullscreen, setShowFullscreen] = useState(false);
  
  // Story components - characters, settings, plot points
  const [storyElements, setStoryElements] = useState({
    characters: [],
    settings: [],
    plotPoints: []
  });
  
  // Initialize story elements from book data
  useEffect(() => {
    if (book) {
      // Extract characters, settings and plot points
      // In a real app, this would come from your book data structure
      setStoryElements({
        characters: [
          { name: book.child_name, role: "protagonist", description: "Main character" },
          { name: "Helper", role: "ally", description: "Helps the protagonist" },
          { name: "Challenger", role: "antagonist", description: "Creates challenges" }
        ],
        settings: [
          { name: "Home", description: "Where the story begins", order: 1 },
          { name: "Adventure Land", description: "Where challenges happen", order: 2 },
          { name: "Victory Place", description: "Where resolution happens", order: 3 }
        ],
        plotPoints: [
          { title: "Beginning", description: "Character starts their normal life", order: 1 },
          { title: "Problem", description: "Something disruptive happens", order: 2 },
          { title: "Journey", description: "Character seeks solution", order: 3 },
          { title: "Challenge", description: "Character faces obstacle", order: 4 },
          { title: "Resolution", description: "Problem is resolved", order: 5 }
        ]
      });
    }
  }, [book]);
  
  // Translations
  const translations = {
    english: {
      "visualizer.story-preview": "Story Visualizer",
      "visualizer.no-pages": "No pages to display yet. Create some content first!",
      "visualizer.page": "Page",
      "visualizer.no-text": "No text content for this page",
      "visualizer.tabs.pages": "Pages",
      "visualizer.tabs.characters": "Characters",
      "visualizer.tabs.plotPoints": "Plot Points",
      "visualizer.tabs.settings": "Settings",
      "visualizer.tabs.relationships": "Relationships",
      "visualizer.tabs.storyArc": "Story Arc",
      "visualizer.fullscreen": "Enter Fullscreen",
      "visualizer.exit-fullscreen": "Exit Fullscreen",
      "visualizer.character.protagonist": "Protagonist",
      "visualizer.character.ally": "Ally",
      "visualizer.character.antagonist": "Antagonist",
      "visualizer.prev": "Previous",
      "visualizer.next": "Next"
    },
    hebrew: {
      "visualizer.story-preview": "מדמה סיפור",
      "visualizer.no-pages": "אין עדיין עמודים להצגה. צור תוכן תחילה!",
      "visualizer.page": "עמוד",
      "visualizer.no-text": "אין תוכן טקסט לעמוד זה",
      "visualizer.tabs.pages": "עמודים",
      "visualizer.tabs.characters": "דמויות",
      "visualizer.tabs.plotPoints": "נקודות עלילה",
      "visualizer.tabs.settings": "סביבות",
      "visualizer.tabs.relationships": "מערכות יחסים",
      "visualizer.tabs.storyArc": "מבנה העלילה",
      "visualizer.fullscreen": "מסך מלא",
      "visualizer.exit-fullscreen": "יציאה ממסך מלא",
      "visualizer.character.protagonist": "גיבור ראשי",
      "visualizer.character.ally": "בעל ברית",
      "visualizer.character.antagonist": "מתנגד",
      "visualizer.prev": "הקודם",
      "visualizer.next": "הבא"
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
  
  const toggleFullscreen = () => {
    setShowFullscreen(!showFullscreen);
    // Implement actual fullscreen functionality
  };
  
  // Render functions for different tabs
  const renderPages = () => {
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
          className="absolute inset-0 bg-cover bg-center rounded-md overflow-hidden"
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
      </div>
    );
  };
  
  const renderCharacters = () => {
    return (
      <div className="p-4 h-full overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {storyElements.characters.map((character, index) => (
            <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
              <div className="flex items-start">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full mr-3">
                  <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">{character.name}</h3>
                  <Badge variant="outline" className="mt-1 mb-2">
                    {t(`visualizer.character.${character.role}`)}
                  </Badge>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{character.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  const renderPlotPoints = () => {
    return (
      <div className="p-4 h-full overflow-y-auto">
        <div className="relative">
          {/* Connecting line */}
          <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-purple-200 dark:bg-purple-900/30"></div>
          
          {/* Plot points */}
          {storyElements.plotPoints.map((point, index) => (
            <div key={index} className="relative mb-8 last:mb-0 ml-8">
              <div className="absolute -left-8 top-0 p-2 rounded-full bg-purple-100 dark:bg-purple-900/30 z-10">
                <ListOrdered className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
                <h3 className="font-medium text-gray-900 dark:text-gray-100">{point.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{point.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  const renderSettings = () => {
    return (
      <div className="p-4 h-full overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {storyElements.settings.map((setting, index) => (
            <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
              <div className="flex items-start">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mr-3">
                  <Map className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <div className="flex items-center">
                    <Badge variant="outline" className="mb-1 mr-2">
                      {setting.order}
                    </Badge>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">{setting.name}</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{setting.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  const renderStoryArc = () => {
    // Arc points based on plot structure (e.g., exposition, rising action, climax, falling action, resolution)
    const arcPoints = [
      { name: "Exposition", value: 0, description: "Beginning of the story" },
      { name: "Rising Action", value: 30, description: "Conflict develops" },
      { name: "Climax", value: 70, description: "Main confrontation" },
      { name: "Falling Action", value: 85, description: "Conflict resolves" },
      { name: "Resolution", value: 100, description: "Story concludes" }
    ];
    
    return (
      <div className="p-4 h-full overflow-y-auto">
        {/* Visual arc representation */}
        <div className="w-full h-40 relative mt-4 mb-8 bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
          {/* Arc line */}
          <div className="absolute left-0 right-0 bottom-1/2 h-0.5 bg-gray-300 dark:bg-gray-600"></div>
          
          {/* Arc curve - SVG representation */}
          <svg className="w-full h-full" viewBox="0 0 100 50">
            <path 
              d="M0,50 C30,50 40,10 50,10 C60,10 70,50 100,50" 
              fill="none" 
              stroke="currentColor" 
              className="text-purple-500 dark:text-purple-400"
              strokeWidth="2"
            />
          </svg>
          
          {/* Arc points */}
          {arcPoints.map((point, index) => (
            <div 
              key={index} 
              className="absolute flex flex-col items-center"
              style={{ 
                left: `${point.value}%`, 
                top: point.name === "Climax" ? "0" : "50%",
                transform: `translateX(-50%) ${point.name === "Climax" ? "translateY(0)" : "translateY(-50%)"}`
              }}
            >
              <div className="p-1.5 rounded-full bg-purple-500 dark:bg-purple-400 z-10"></div>
              <span className="text-xs font-medium mt-1 whitespace-nowrap">{point.name}</span>
            </div>
          ))}
        </div>
        
        {/* Arc descriptions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-4">
          {arcPoints.map((point, index) => (
            <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-gray-800">
              <div className="flex items-center mb-1">
                <Badge className="mr-2 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                  {index + 1}
                </Badge>
                <h4 className="font-medium">{point.name}</h4>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300">{point.description}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  const renderRelationships = () => {
    // Sample character relationships
    const relationships = [
      { from: "Protagonist", to: "Ally", type: "friendship", description: "Supports and helps" },
      { from: "Protagonist", to: "Antagonist", type: "conflict", description: "Creates obstacles" },
      { from: "Ally", to: "Antagonist", type: "rivalry", description: "Old rivals" }
    ];
    
    return (
      <div className="p-4 h-full overflow-y-auto">
        <div className="flex justify-center mb-8">
          {/* Simple relationship diagram */}
          <div className="relative max-w-md aspect-square">
            {/* Center character */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-4 rounded-full bg-purple-100 dark:bg-purple-900/30 z-10 flex items-center justify-center">
              <div className="text-center">
                <Users className="h-8 w-8 text-purple-600 dark:text-purple-400 mx-auto mb-1" />
                <span className="text-sm font-medium">Protagonist</span>
              </div>
            </div>
            
            {/* Other characters */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 p-4 rounded-full bg-green-100 dark:bg-green-900/30 z-10 flex items-center justify-center">
              <div className="text-center">
                <Users className="h-6 w-6 text-green-600 dark:text-green-400 mx-auto mb-1" />
                <span className="text-xs font-medium">Ally</span>
              </div>
            </div>
            
            <div className="absolute bottom-0 left-0 p-4 rounded-full bg-red-100 dark:bg-red-900/30 z-10 flex items-center justify-center">
              <div className="text-center">
                <Users className="h-6 w-6 text-red-600 dark:text-red-400 mx-auto mb-1" />
                <span className="text-xs font-medium">Antagonist</span>
              </div>
            </div>
            
            {/* Relationship lines */}
            <svg className="absolute inset-0 w-full h-full">
              <line x1="50%" y1="50%" x2="50%" y2="10%" stroke="currentColor" className="text-green-400" strokeWidth="2" strokeDasharray="4" />
              <line x1="50%" y1="50%" x2="15%" y2="85%" stroke="currentColor" className="text-red-400" strokeWidth="2" strokeDasharray="4" />
              <line x1="15%" y1="85%" x2="50%" y2="10%" stroke="currentColor" className="text-yellow-400" strokeWidth="2" strokeDasharray="4" />
            </svg>
          </div>
        </div>
        
        {/* Relationship details */}
        <div className="grid grid-cols-1 gap-3">
          {relationships.map((rel, index) => (
            <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-gray-800">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <span className="font-medium text-gray-900 dark:text-gray-100">{rel.from}</span>
                  <ArrowRight className="h-4 w-4 mx-2 text-gray-400" />
                  <span className="font-medium text-gray-900 dark:text-gray-100">{rel.to}</span>
                </div>
                <Badge className={
                  rel.type === "friendship" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" :
                  rel.type === "conflict" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" :
                  "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                }>
                  {rel.type}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">{rel.description}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <Card className={`h-full flex flex-col ${showFullscreen ? "fixed inset-0 z-50" : ""}`}>
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
            <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
              <Maximize className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-grow p-0 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="mx-3 my-2">
            <TabsTrigger value="pages" className="flex items-center gap-1">
              <Book className="h-4 w-4" />
              <span className="hidden sm:inline">{t("visualizer.tabs.pages")}</span>
            </TabsTrigger>
            <TabsTrigger value="characters" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">{t("visualizer.tabs.characters")}</span>
            </TabsTrigger>
            <TabsTrigger value="plotPoints" className="flex items-center gap-1">
              <ListOrdered className="h-4 w-4" />
              <span className="hidden sm:inline">{t("visualizer.tabs.plotPoints")}</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-1">
              <Map className="h-4 w-4" />
              <span className="hidden sm:inline">{t("visualizer.tabs.settings")}</span>
            </TabsTrigger>
            <TabsTrigger value="storyArc" className="flex items-center gap-1">
              <LineChart className="h-4 w-4" />
              <span className="hidden sm:inline">{t("visualizer.tabs.storyArc")}</span>
            </TabsTrigger>
            <TabsTrigger value="relationships" className="flex items-center gap-1">
              <Layers className="h-4 w-4" />
              <span className="hidden sm:inline">{t("visualizer.tabs.relationships")}</span>
            </TabsTrigger>
          </TabsList>
          
          <div className="flex-grow overflow-hidden">
            <TabsContent value="pages" className="h-full m-0">
              <div className="w-full h-full aspect-[4/3] sm:aspect-[16/9] bg-gray-100 dark:bg-gray-800 relative overflow-hidden rounded-md mx-3">
                {renderPages()}
              </div>
            </TabsContent>
            
            <TabsContent value="characters" className="h-full m-0">
              {renderCharacters()}
            </TabsContent>
            
            <TabsContent value="plotPoints" className="h-full m-0">
              {renderPlotPoints()}
            </TabsContent>
            
            <TabsContent value="settings" className="h-full m-0">
              {renderSettings()}
            </TabsContent>
            
            <TabsContent value="storyArc" className="h-full m-0">
              {renderStoryArc()}
            </TabsContent>
            
            <TabsContent value="relationships" className="h-full m-0">
              {renderRelationships()}
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
      
      {activeTab === "pages" && (
        <CardFooter className="p-3 flex flex-col space-y-2">
          <div className="flex items-center justify-between w-full">
            <Button variant="ghost" size="sm" onClick={goToPreviousPage} disabled={currentPage === 0}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              {t("visualizer.prev")}
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
              {t("visualizer.next")}
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
      )}
    </Card>
  );
}