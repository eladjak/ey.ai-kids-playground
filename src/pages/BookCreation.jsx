
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Book } from "@/entities/Book";
import { Page } from "@/entities/Page";
import { GenerateImage, InvokeLLM } from "@/integrations/Core";
import { buildSafetyPromptPrefix, sanitizeAIOutput } from "@/utils/content-moderation";
import { createPageUrl } from "@/utils";
import { 
  ArrowLeft, 
  Save, 
  Book as BookIcon, 
  Image, 
  Edit, 
  RotateCw, 
  CheckCircle,
  Share2,
  BookOpen,
  Settings,
  Sparkles,
  Palette,
  Type,
  Eye,
  Music,
  MessageSquare,
  RefreshCw,
  Users,
  PenTool,
  Wand2,
  Lightbulb,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Collaboration } from "@/entities/Collaboration";
import { User } from "@/entities/User";
import GenerationSteps from "../components/bookCreation/GenerationSteps";
import BookCoverPreview from "../components/bookCreation/BookCoverPreview";
import CollaborativeEditor from "../components/collaborate/CollaborativeEditor";
import CollaboratorsList from "../components/collaborate/CollaboratorsList";
import PageStyler from "../components/bookCreation/PageStyler";
import RhymeOptions from "../components/bookCreation/RhymeOptions";
import InteractiveElementsPanel from "../components/bookCreation/InteractiveElementsPanel";
import StoryVisualizer from "../components/bookCreation/StoryVisualizer";
import ShareOptions from "../components/bookCreation/ShareOptions";

export default function BookCreation() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [book, setBook] = useState(null);
  const [pages, setPages] = useState([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingStep, setGeneratingStep] = useState(0);
  const [isOwner, setIsOwner] = useState(false);
  const [collaborators, setCollaborators] = useState([]);
  const [activeTab, setActiveTab] = useState("editor");
  const [useRhyming, setUseRhyming] = useState(false);
  const [rhymeSettings, setRhymeSettings] = useState({
    pattern: "aabb",
    meter: "iambic",
    complexity: "simple"
  });
  const [textStyles, setTextStyles] = useState({
    fontSize: 18,
    fontFamily: "Arial",
    color: "#000000",
    showNikud: true,
    fontWeight: "normal",
    alignment: "right",
    lineHeight: 1.5
  });
  const [interactiveElements, setInteractiveElements] = useState([]);
  const [characterConsistency, setCharacterConsistency] = useState({
    mainCharacter: {},
    secondaryCharacters: [],
    settings: [],
    style: "consistent"
  });
  
  // Current page editing state
  const [currentPageText, setCurrentPageText] = useState("");
  const [currentPageImagePrompt, setCurrentPageImagePrompt] = useState("");
  const [currentPageLayout, setCurrentPageLayout] = useState("text_top");
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);
  
  // Get book ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const bookId = urlParams.get("id");
  
  useEffect(() => {
    if (!bookId) {
      navigate(createPageUrl("Library"));
      return;
    }
    
    loadBookData();
  }, [bookId]);
  
  useEffect(() => {
    if (pages.length > 0 && currentPageIndex >= 0 && currentPageIndex < pages.length) {
      const currentPage = pages[currentPageIndex];
      setCurrentPageText(currentPage.text_content || "");
      setCurrentPageImagePrompt(currentPage.image_prompt || "");
      setCurrentPageLayout(currentPage.layout_type || "text_top");
    }
  }, [pages, currentPageIndex]);
  
  const loadBookData = async () => {
    try {
      setIsLoading(true);
      
      // Load book data
      const bookData = await Book.get(bookId);
      setBook(bookData);
      
      // Check if user is the owner
      const currentUser = await User.me();
      setIsOwner(bookData.created_by === currentUser.email);
      
      // Load pages
      const pagesData = await Page.filter({ book_id: bookId }, "page_number");
      setPages(pagesData);
      
      // Initialize character consistency data based on the book
      setCharacterConsistency({
        mainCharacter: {
          name: bookData.child_name,
          age: bookData.child_age,
          description: bookData.child_gender === "boy" ? "Boy with short hair" : 
                       bookData.child_gender === "girl" ? "Girl with long hair" : 
                       "Child with medium-length hair",
          interests: bookData.interests || ""
        },
        secondaryCharacters: bookData.family_members ? 
          bookData.family_members.split(',').map(member => ({ name: member.trim(), description: "" })) : [],
        settings: [],
        style: bookData.art_style || "disney"
      });
      
      // Load collaborators if any
      const collaborationsData = await Collaboration.filter({ book_id: bookId, status: "accepted" });
      if (collaborationsData.length > 0) {
        const collaboratorsList = await Promise.all(
          collaborationsData.map(async (collab) => {
            try {
              const user = await User.get(collab.collaborator_id);
              return {
                ...collab,
                user
              };
            } catch (error) {
              return {
                ...collab,
                user: { full_name: collab.collaborator_email }
              };
            }
          })
        );
        setCollaborators(collaboratorsList);
      }
      
      setIsLoading(false);
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Failed to load book data. Please try again."
      });
      navigate(createPageUrl("Library"));
    }
  };
  
  const generateBook = async () => {
    if (isGenerating) return;
    
    try {
      setIsGenerating(true);
      setGeneratingStep(1);
      
      // Update book status
      await Book.update(bookId, { status: "generating" });
      
      // Generate story outline
      const outlinePrompt = getStoryOutlinePrompt();
      setGeneratingStep(2);
      
      const outlineResult = await InvokeLLM({
        prompt: outlinePrompt,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            outline: { 
              type: "array", 
              items: { 
                type: "object",
                properties: {
                  page_number: { type: "number" },
                  description: { type: "string" }
                }
              }
            }
          }
        }
      });
      
      // Update book title if needed
      if (outlineResult.title && (!book.title || book.title === "")) {
        await Book.update(bookId, { title: outlineResult.title });
        setBook(prev => ({ ...prev, title: outlineResult.title }));
      }
      
      // Generate pages one by one
      setGeneratingStep(3);
      
      const newPages = [];
      for (let i = 0; i < outlineResult.outline.length; i++) {
        const pageOutline = outlineResult.outline[i];
        
        // Generate page text
        const pageTextPrompt = getPageTextPrompt(pageOutline.description, i);
        const pageTextResult = await InvokeLLM({
          prompt: pageTextPrompt,
          response_json_schema: {
            type: "object",
            properties: {
              text_content: { type: "string" },
              image_prompt: { type: "string" }
            }
          }
        });
        
        // Generate image
        const imagePrompt = getEnhancedImagePrompt(pageTextResult.image_prompt, i);
        const imageResult = await GenerateImage({
          prompt: imagePrompt
        });
        
        // Create page in database
        const pageData = {
          book_id: bookId,
          page_number: i,
          text_content: pageTextResult.text_content,
          image_url: imageResult.url,
          image_prompt: imagePrompt,
          layout_type: getLayoutForPageNumber(i)
        };
        
        const createdPage = await Page.create(pageData);
        newPages.push(createdPage);
        
        // Update generation step for UI feedback
        setGeneratingStep(3 + Math.floor((i + 1) * 7 / outlineResult.outline.length));
      }
      
      // Update book status and pages
      await Book.update(bookId, { status: "complete" });
      setGeneratingStep(10);
      
      // Update local state
      setPages(newPages);
      setBook(prev => ({ ...prev, status: "complete" }));
      
      toast({
        description: "Book successfully generated!",
        className: "bg-green-100 text-green-900 dark:bg-green-900/50 dark:text-green-100"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Failed to generate book. Please try again."
      });
      
      // Reset book status
      await Book.update(bookId, { status: "draft" });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const getStoryOutlinePrompt = () => {
    const { title, child_name, child_age, genre, age_range, tone, moral, length, interests, family_members } = book;

    let pageCount = 10;
    if (length === "short") pageCount = 6;
    if (length === "long") pageCount = 15;

    const safetyPrefix = buildSafetyPromptPrefix(age_range || '5-10');

    return `${safetyPrefix}Create a detailed outline for a personalized children's book with the following details:
      - Title: ${title || "Generate a catchy title"}
      - Main character: ${child_name}, age ${child_age}
      - Genre: ${genre}
      - Target age range: ${age_range}
      - Tone: ${tone}
      - Moral or lesson: ${moral || "Should include a positive message appropriate for children"}
      - Child's interests: ${interests || "general children's interests"}
      - Family members to include: ${family_members || ""}
      ${useRhyming ? `- The story should be written in rhyming format with pattern: ${rhymeSettings.pattern}, meter: ${rhymeSettings.meter}, complexity: ${rhymeSettings.complexity}` : ""}
      
      The outline should include exactly ${pageCount} pages (including a title page). 
      For each page, provide a brief description of what happens in the story at that point.
      The story should have a clear beginning, middle, and end.
      Make sure the story is engaging, age-appropriate, and has a positive message.
      
      Return the result as JSON with:
      1. A title (if not provided)
      2. An array of page outlines with page_number and description
    `;
  };
  
  const getPageTextPrompt = (pageDescription, pageNumber) => {
    const { child_name, child_age, genre, age_range, art_style } = book;
    const safetyPrefix = buildSafetyPromptPrefix(age_range || '5-10');

    return `${safetyPrefix}Write the text content for page ${pageNumber} of a children's story based on this description: "${pageDescription}"
    
    Story details:
    - Main character: ${child_name}, age ${child_age}
    - Genre: ${genre}
    - Target age range: ${age_range}
    - Art style: ${art_style}
    ${useRhyming ? `- The text should be written in rhyming format with pattern: ${rhymeSettings.pattern}, meter: ${rhymeSettings.meter}, complexity: ${rhymeSettings.complexity}` : ""}
    
    ${pageNumber === 0 ? "This is the title page/introduction. Keep it brief and engaging." : ""}
    
    Also create a detailed image generation prompt that would illustrate this page perfectly.
    The image should match the art style and clearly depict the scene described.
    The description should be detailed enough to generate a consistent character appearance throughout the book.
    
    Return the result as JSON with:
    1. text_content: The actual text that will appear on the page
    2. image_prompt: A detailed prompt for image generation
    `;
  };
  
  const getEnhancedImagePrompt = (basePrompt, pageNumber) => {
    const { child_name, child_gender, art_style } = book;
    const { mainCharacter, secondaryCharacters, style } = characterConsistency;
    
    const characterDescription = `The main character ${child_name} is a ${mainCharacter.description || 
      (child_gender === "boy" ? "young boy" : 
       child_gender === "girl" ? "young girl" : "young child")}`;
    
    const secondaryDescriptions = secondaryCharacters.length > 0 
      ? "Secondary characters: " + secondaryCharacters.map(char => `${char.name} (${char.description || "family member"})`).join(", ")
      : "";
    
    const styleGuide = `Illustration style: ${art_style || style || "disney"}, consistent character appearances throughout the story, high quality children's book illustration`;
    
    return `${basePrompt}\n\n${characterDescription}. ${secondaryDescriptions}\n\n${styleGuide}\n\nBright, vibrant colors, child-friendly, appealing to children in the age range ${book.age_range}, emotive and expressive. IMPORTANT: The image must be completely child-safe, age-appropriate, non-violent, and non-scary.`;
  };
  
  const getLayoutForPageNumber = (pageNumber) => {
    // Alternate layouts for visual interest
    const layouts = ["text_top", "text_bottom", "text_left", "text_right"];
    return layouts[pageNumber % layouts.length];
  };
  
  const updatePageText = async () => {
    if (currentPageIndex < 0 || currentPageIndex >= pages.length) return;
    
    try {
      const pageId = pages[currentPageIndex].id;
      await Page.update(pageId, { text_content: currentPageText });
      
      // Update local state
      const updatedPages = [...pages];
      updatedPages[currentPageIndex] = {
        ...updatedPages[currentPageIndex],
        text_content: currentPageText
      };
      setPages(updatedPages);
      
      toast({
        description: "Page text updated successfully",
        className: "bg-green-100 text-green-900 dark:bg-green-900/50 dark:text-green-100"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Failed to update page text. Please try again."
      });
    }
  };
  
  const updatePageImage = async () => {
    if (currentPageIndex < 0 || currentPageIndex >= pages.length || !currentPageImagePrompt) return;
    
    try {
      setIsGenerating(true);
      
      // Generate new image
      const enhancedPrompt = getEnhancedImagePrompt(currentPageImagePrompt, currentPageIndex);
      const imageResult = await GenerateImage({
        prompt: enhancedPrompt
      });
      
      // Update page
      const pageId = pages[currentPageIndex].id;
      await Page.update(pageId, { 
        image_url: imageResult.url,
        image_prompt: enhancedPrompt
      });
      
      // Update local state
      const updatedPages = [...pages];
      updatedPages[currentPageIndex] = {
        ...updatedPages[currentPageIndex],
        image_url: imageResult.url,
        image_prompt: enhancedPrompt
      };
      setPages(updatedPages);
      
      toast({
        description: "Page image updated successfully",
        className: "bg-green-100 text-green-900 dark:bg-green-900/50 dark:text-green-100"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Failed to update page image. Please try again."
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const updatePageLayout = async (newLayout) => {
    if (currentPageIndex < 0 || currentPageIndex >= pages.length) return;
    
    try {
      const pageId = pages[currentPageIndex].id;
      await Page.update(pageId, { layout_type: newLayout });
      
      // Update local state
      const updatedPages = [...pages];
      updatedPages[currentPageIndex] = {
        ...updatedPages[currentPageIndex],
        layout_type: newLayout
      };
      setPages(updatedPages);
      setCurrentPageLayout(newLayout);
      
      toast({
        description: "Page layout updated successfully",
        className: "bg-green-100 text-green-900 dark:bg-green-900/50 dark:text-green-100"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Failed to update page layout. Please try again."
      });
    }
  };
  
  const addNikudToText = async () => {
    if (!currentPageText) return;
    
    try {
      const result = await InvokeLLM({
        prompt: `Add correct Hebrew nikud (vocalization) to the following text. Only return the text with added nikud. Text: "${currentPageText}"`,
        response_json_schema: {
          type: "object",
          properties: {
            text_with_nikud: { type: "string" }
          }
        }
      });
      
      if (result.text_with_nikud) {
        setCurrentPageText(result.text_with_nikud);
        toast({
          description: "ניקוד נוסף בהצלחה",
          className: "bg-green-100 text-green-900 dark:bg-green-900/50 dark:text-green-100"
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        description: "שגיאה בהוספת ניקוד. אנא נסה שוב."
      });
    }
  };
  
  const convertToRhyme = async () => {
    if (!currentPageText) return;
    
    try {
      setIsGenerating(true);
      
      const result = await InvokeLLM({
        prompt: `Convert the following text to a rhyming format in the same language. 
        Use rhyme pattern: ${rhymeSettings.pattern}, 
        meter: ${rhymeSettings.meter}, 
        complexity: ${rhymeSettings.complexity}.
        Maintain the same meaning and tone. Text: "${currentPageText}"`,
        response_json_schema: {
          type: "object",
          properties: {
            rhyming_text: { type: "string" }
          }
        }
      });
      
      if (result.rhyming_text) {
        setCurrentPageText(result.rhyming_text);
        toast({
          description: "Converted to rhyming text successfully",
          className: "bg-green-100 text-green-900 dark:bg-green-900/50 dark:text-green-100"
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Failed to convert text to rhyme. Please try again."
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const addInteractiveElement = (element) => {
    setInteractiveElements(prev => [...prev, element]);
    
    toast({
      description: `Added ${element.type} interactive element`,
      className: "bg-green-100 text-green-900 dark:bg-green-900/50 dark:text-green-100"
    });
  };
  
  // Rendering functions
  const renderPagePreview = () => {
    const currentPage = pages[currentPageIndex];
    if (!currentPage) return null;
    
    const isRTL = book.language === "hebrew" || book.language === "yiddish";
    
    const getLayoutClasses = () => {
      switch (currentPageLayout) {
        case "text_top":
          return "flex-col";
        case "text_bottom":
          return "flex-col-reverse";
        case "text_left":
          return isRTL ? "flex-row-reverse" : "flex-row";
        case "text_right":
          return isRTL ? "flex-row" : "flex-row-reverse";
        default:
          return "flex-col";
      }
    };
    
    const getTextStyle = () => {
      return {
        fontSize: `${textStyles.fontSize}px`,
        fontFamily: textStyles.fontFamily,
        color: textStyles.color,
        fontWeight: textStyles.fontWeight,
        textAlign: textStyles.alignment,
        lineHeight: textStyles.lineHeight,
        direction: isRTL ? "rtl" : "ltr"
      };
    };
    
    return (
      <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-md bg-white dark:bg-gray-800">
        <div className={`flex ${getLayoutClasses()} h-full`}>
          <div className="flex-1 p-6 flex items-center">
            <div style={getTextStyle()} className="w-full">
              {currentPageText}
              
              {/* Interactive elements would be rendered here */}
              {interactiveElements
                .filter(element => element.pageIndex === currentPageIndex)
                .map((element, idx) => (
                  <div key={idx} className="my-2 p-2 border border-purple-300 rounded">
                    {element.type === "question" && (
                      <div>
                        <p className="font-bold">{element.content}</p>
                        <div className="flex gap-2 mt-2">
                          {element.options.map((option, i) => (
                            <button key={i} className="px-2 py-1 bg-purple-100 rounded">
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {element.type === "animation" && (
                      <div className="text-center text-purple-600">
                        [Animation: {element.description}]
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
          <div className="flex-1 bg-gray-100 dark:bg-gray-700 relative">
            {currentPage.image_url ? (
              <img 
                src={currentPage.image_url} 
                alt={`Page ${currentPageIndex}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full min-h-[300px] flex items-center justify-center">
                <p className="text-gray-400">No image available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center">
          <RotateCw className="h-10 w-10 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-lg text-gray-600 dark:text-gray-300">Loading your book...</p>
        </div>
      </div>
    );
  }
  
  if (isGenerating) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Creating Your Book
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Please wait while we create a magical story just for you...
          </p>
        </div>
        
        <GenerationSteps currentStep={generatingStep} />
      </div>
    );
  }
  
  const currentLanguage = "hebrew"; // Example of switching languages

  if (book.status === "complete") {
    return (
      <div className="max-w-7xl mx-auto py-4">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(createPageUrl("Library"))}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {currentLanguage === "hebrew" ? "חזרה לספרייה" : "Back to Library"}
          </Button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {book.title || (currentLanguage === "hebrew" ? "יצירת הספר שלך" : "Create Your Book")}
          </h1>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="bg-purple-100/50 dark:bg-purple-900/20 p-1 rounded-xl">
            <TabsTrigger 
              value="editor" 
              className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800"
            >
              <Edit className="h-4 w-4" />
              <span className="hidden sm:inline">{currentLanguage === "hebrew" ? "ערוך ספר" : "Edit Book"}</span>
            </TabsTrigger>
            <TabsTrigger 
              value="preview" 
              className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800"
            >
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">{currentLanguage === "hebrew" ? "תצוגה מקדימה" : "Preview"}</span>
            </TabsTrigger>
            <TabsTrigger 
              value="styling" 
              className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800"
            >
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">{currentLanguage === "hebrew" ? "עיצוב" : "Styling"}</span>
            </TabsTrigger>
            <TabsTrigger 
              value="interactive" 
              className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800"
            >
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">{currentLanguage === "hebrew" ? "אינטרקטיבי" : "Interactive"}</span>
            </TabsTrigger>
            <TabsTrigger 
              value="collaborate" 
              className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800"
            >
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">{currentLanguage === "hebrew" ? "שיתופי פעולה" : "Collaborate"}</span>
            </TabsTrigger>
            <TabsTrigger 
              value="visualize" 
              className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800"
            >
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">{currentLanguage === "hebrew" ? "וויזואליזציה" : "Visualize"}</span>
            </TabsTrigger>
            <TabsTrigger 
              value="share" 
              className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800"
            >
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">{currentLanguage === "hebrew" ? "שתף" : "Share"}</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="editor" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                {renderPagePreview()}
                
                <div className="flex justify-between mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPageIndex(Math.max(0, currentPageIndex - 1))}
                    disabled={currentPageIndex === 0}
                  >
                    {currentLanguage === "hebrew" ? "עמוד קודם" : "Previous Page"}
                  </Button>
                  <span className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    {currentLanguage === "hebrew" ? `עמוד ${currentPageIndex + 1} מתוך ${pages.length}` : `Page ${currentPageIndex + 1} of ${pages.length}`}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPageIndex(Math.min(pages.length - 1, currentPageIndex + 1))}
                    disabled={currentPageIndex === pages.length - 1}
                  >
                    {currentLanguage === "hebrew" ? "עמוד הבא" : "Next Page"}
                  </Button>
                </div>
              </div>
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <Edit className="h-5 w-5 mr-2 text-purple-500" />
                      {currentLanguage === "hebrew" ? "ערוך טקסט עמוד" : "Edit Page Text"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Textarea
                        value={currentPageText}
                        onChange={(e) => setCurrentPageText(e.target.value)}
                        className="min-h-[200px] font-medium"
                        dir={book.language === "hebrew" || book.language === "yiddish" ? "rtl" : "ltr"}
                      />
                      <div className="flex flex-wrap gap-2">
                        <Button onClick={updatePageText} className="flex-1">
                          {currentLanguage === "hebrew" ? "שמור טקסט" : "Save Text"}
                        </Button>
                        {(book.language === "hebrew" || book.language === "yiddish") && (
                          <Button variant="outline" onClick={addNikudToText} className="flex-1">
                            {currentLanguage === "hebrew" ? "הוסף ניקוד" : "Add Nikud"}
                          </Button>
                        )}
                        {useRhyming && (
                          <Button 
                            variant="outline" 
                            onClick={convertToRhyme} 
                            className="flex-1"
                            disabled={isGenerating}
                          >
                            {isGenerating ? (
                              <RotateCw className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <Music className="h-4 w-4 mr-2" />
                            )}
                            {currentLanguage === "hebrew" ? "בנה חריזה" : "Make Rhyme"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Accordion type="single" collapsible className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <AccordionItem value="image">
                    <AccordionTrigger className="px-4">
                      <div className="flex items-center">
                        <Image className="h-5 w-5 mr-2 text-purple-500" />
                        <span>{currentLanguage === "hebrew" ? "עריכת תמונת עמוד" : "Edit Page Image"}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between mb-2">
                          <Label htmlFor="imagePrompt">{currentLanguage === "hebrew" ? "הנחיה לתמונה" : "Image Prompt"}</Label>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-8 px-2 text-xs"
                            onClick={() => setIsEditingPrompt(!isEditingPrompt)}
                          >
                            {isEditingPrompt ? (currentLanguage === "hebrew" ? "השתמש במצב פשוט" : "Use Simple Mode") : (currentLanguage === "hebrew" ? "ערוך הנחיה מלאה" : "Edit Full Prompt")}
                          </Button>
                        </div>
                        
                        {isEditingPrompt ? (
                          <Textarea
                            id="imagePrompt"
                            value={currentPageImagePrompt}
                            onChange={(e) => setCurrentPageImagePrompt(e.target.value)}
                            className="min-h-[150px]"
                            placeholder={currentLanguage === "hebrew" ? "הנחיות מפורטות על מה צריך להיות בתמונה..." : "Detailed image generation prompt..."}
                          />
                        ) : (
                          <div className="space-y-3">
                            <Input
                              value={currentPageImagePrompt}
                              onChange={(e) => setCurrentPageImagePrompt(e.target.value)}
                              placeholder={currentLanguage === "hebrew" ? "תאר מה צריך להיות בתמונה..." : "Describe what should be in the image..."}
                            />
                            <div className="flex flex-wrap gap-1">
                              {["Character", "Setting", "Action", "Emotion"].map(tag => (
                                <Button 
                                  key={tag} 
                                  variant="outline" 
                                  size="sm"
                                  className="text-xs h-7"
                                  onClick={() => setCurrentPageImagePrompt(prev => 
                                    prev + (prev ? ", " : "") + tag.toLowerCase() + ": "
                                  )}
                                >
                                  {currentLanguage === "hebrew" ? `+${tag}` : `+${tag}`}
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <Button
                          onClick={updatePageImage}
                          disabled={isGenerating || !currentPageImagePrompt}
                          className="w-full"
                        >
                          {isGenerating ? (
                            <>
                              <RotateCw className="h-4 w-4 animate-spin mr-2" />
                              {currentLanguage === "hebrew" ? "מייצר..." : "Generating..."}
                            </>
                          ) : (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2" />
                              {currentLanguage === "hebrew" ? "שחזר תמונה" : "Regenerate Image"}
                            </>
                          )}
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="layout">
                    <AccordionTrigger className="px-4">
                      <div className="flex items-center">
                        <Settings className="h-5 w-5 mr-2 text-purple-500" />
                        <span>{currentLanguage === "hebrew" ? "פריסת עמוד" : "Page Layout"}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <RadioGroup 
                        className="grid grid-cols-2 gap-2"
                        value={currentPageLayout}
                        onValueChange={updatePageLayout}
                      >
                        <div className="flex items-center space-x-2 border border-gray-200 dark:border-gray-700 rounded p-2">
                          <RadioGroupItem value="text_top" id="text_top" />
                          <Label htmlFor="text_top" className="flex flex-col items-center cursor-pointer">
                            <div className="w-20 h-12 bg-gray-100 dark:bg-gray-700 rounded flex flex-col">
                              <div className="h-1/2 bg-purple-200 dark:bg-purple-800 rounded-t"></div>
                              <div className="h-1/2"></div>
                            </div>
                            <span className="text-xs mt-1">{currentLanguage === "hebrew" ? "טקסט למעלה" : "Text Top"}</span>
                          </Label>
                        </div>
                        
                        <div className="flex items-center space-x-2 border border-gray-200 dark:border-gray-700 rounded p-2">
                          <RadioGroupItem value="text_bottom" id="text_bottom" />
                          <Label htmlFor="text_bottom" className="flex flex-col items-center cursor-pointer">
                            <div className="w-20 h-12 bg-gray-100 dark:bg-gray-700 rounded flex flex-col">
                              <div className="h-1/2"></div>
                              <div className="h-1/2 bg-purple-200 dark:bg-purple-800 rounded-b"></div>
                            </div>
                            <span className="text-xs mt-1">{currentLanguage === "hebrew" ? "טקסט למטה" : "Text Bottom"}</span>
                          </Label>
                        </div>
                        
                        <div className="flex items-center space-x-2 border border-gray-200 dark:border-gray-700 rounded p-2">
                          <RadioGroupItem value="text_left" id="text_left" />
                          <Label htmlFor="text_left" className="flex flex-col items-center cursor-pointer">
                            <div className="w-20 h-12 bg-gray-100 dark:bg-gray-700 rounded flex flex-row">
                              <div className="w-1/2 bg-purple-200 dark:bg-purple-800 rounded-l"></div>
                              <div className="w-1/2"></div>
                            </div>
                            <span className="text-xs mt-1">{currentLanguage === "hebrew" ? "טקסט שמאלה" : "Text Left"}</span>
                          </Label>
                        </div>
                        
                        <div className="flex items-center space-x-2 border border-gray-200 dark:border-gray-700 rounded p-2">
                          <RadioGroupItem value="text_right" id="text_right" />
                          <Label htmlFor="text_right" className="flex flex-col items-center cursor-pointer">
                            <div className="w-20 h-12 bg-gray-100 dark:bg-gray-700 rounded flex flex-row">
                              <div className="w-1/2"></div>
                              <div className="w-1/2 bg-purple-200 dark:bg-purple-800 rounded-r"></div>
                            </div>
                            <span className="text-xs mt-1">{currentLanguage === "hebrew" ? "טקסט ימינה" : "Text Right"}</span>
                          </Label>
                        </div>
                      </RadioGroup>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => navigate(createPageUrl("Library"))}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {currentLanguage === "hebrew" ? "חזרה לספרייה" : "Back to Library"}
                  </Button>
                  <Link to={`${createPageUrl("BookView")}?id=${bookId}`}>
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      <BookOpen className="h-4 w-4 mr-2" />
                      {currentLanguage === "hebrew" ? "צפה בספר המלא" : "View Full Book"}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="preview">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 mb-6">
              <iframe 
                src={`${createPageUrl("BookView")}?id=${bookId}`} 
                className="w-full h-[70vh] rounded-lg border bg-white shadow-lg overflow-hidden"
                title="Book Preview"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="styling">
            <PageStyler 
              textStyles={textStyles}
              setTextStyles={setTextStyles}
              bookLanguage={book.language}
              onApplyStyles={(styles) => {
                setTextStyles(styles);
                toast({
                  description: currentLanguage === "hebrew" ? "סגנונות טקסט עודכנו" : "Text styles updated",
                  className: "bg-green-100 text-green-900"
                });
              }}
            />
            
            <div className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Music className="h-5 w-5 mr-2 text-purple-500" />
                    {currentLanguage === "hebrew" ? "אפשרויות חריזה" : "Rhyming Options"}
                  </CardTitle>
                  <CardDescription>
                    {currentLanguage === "hebrew" ? "הוסף תבניות חריזה כדי להפוך את הסיפור שלך למוזיקלי ומרתק" : "Add rhyming patterns to make your story more musical and engaging"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 flex items-center justify-between">
                    <Label htmlFor="use-rhyming" className="font-medium">{currentLanguage === "hebrew" ? "אפשר חריזה" : "Enable Rhyming"}</Label>
                    <Switch 
                      id="use-rhyming" 
                      checked={useRhyming}
                      onCheckedChange={setUseRhyming}
                    />
                  </div>
                  
                  {useRhyming && (
                    <RhymeOptions 
                      rhymeSettings={rhymeSettings}
                      setRhymeSettings={setRhymeSettings}
                      currentLanguage={currentLanguage}
                    />
                  )}
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={convertToRhyme} 
                    className="w-full"
                    disabled={!useRhyming || isGenerating}
                  >
                    {isGenerating ? (
                      <RotateCw className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Wand2 className="h-4 w-4 mr-2" />
                    )}
                    {currentLanguage === "hebrew" ? "החל חריזה על עמוד נוכחי" : "Apply Rhyming to Current Page"}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="interactive">
            <InteractiveElementsPanel 
              currentPageIndex={currentPageIndex} 
              addInteractiveElement={addInteractiveElement}
              bookLanguage={book.language}
            />
          </TabsContent>
          
          <TabsContent value="collaborate">
            <CollaborativeEditor 
              book={book}
              pages={pages}
              currentPage={pages[currentPageIndex]}
              currentPageIndex={currentPageIndex}
              setCurrentPageIndex={setCurrentPageIndex}
              onUpdateText={(text) => {
                setCurrentPageText(text);
                updatePageText();
              }}
              collaborators={collaborators}
              isOwner={isOwner}
            />
          </TabsContent>
          
          <TabsContent value="visualize">
            <StoryVisualizer 
              book={book}
              pages={pages}
            />
          </TabsContent>
          
          <TabsContent value="share">
            <ShareOptions 
              book={book}
              bookId={bookId}
            />
          </TabsContent>
        </Tabs>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Button
            variant="ghost"
            onClick={() => navigate(createPageUrl("Library"))}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {currentLanguage === "hebrew" ? "חזרה לספרייה" : "Back to Library"}
          </Button>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {book.title || (currentLanguage === "hebrew" ? "יצירת הספר שלך" : "Create Your Book")}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {currentLanguage === "hebrew" 
            ? "אנחנו מוכנים ליצור סיפור מותאם אישית על פי העדפותיך." 
            : "We're ready to create a personalized story based on your preferences."}
        </p>
      </div>
      
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-300">
          <BookIcon className="h-8 w-8" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            {currentLanguage === "hebrew" 
              ? `הסיפור של ${book.child_name}` 
              : `${book.child_name}'s Story`}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {currentLanguage === "hebrew" 
              ? `גיל: ${book.child_age} • סוגה: ${translateGenre(book.genre)} • סגנון: ${translateArtStyle(book.art_style)}`
              : `Age: ${book.child_age} • Genre: ${book.genre.replace(/_/g, ' ')} • Style: ${book.art_style.replace(/_/g, ' ')}`}
          </p>
        </div>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lightbulb className="h-5 w-5 mr-2 text-amber-500" />
            {currentLanguage === "hebrew" 
              ? "הגדרות עקביות דמויות" 
              : "Character Consistency Settings"}
          </CardTitle>
          <CardDescription>
            {currentLanguage === "hebrew" 
              ? "שמור על מראה עקבי של הדמויות לאורך כל הסיפור שלך" 
              : "Ensure consistent character appearance throughout your story"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label className="font-medium mb-1 block">
                {currentLanguage === "hebrew" 
                  ? "תיאור הדמות הראשית" 
                  : "Main Character Description"}
              </Label>
              <Textarea
                value={characterConsistency.mainCharacter.description || ""}
                onChange={(e) => setCharacterConsistency({
                  ...characterConsistency,
                  mainCharacter: {
                    ...characterConsistency.mainCharacter,
                    description: e.target.value
                  }
                })}
                placeholder={currentLanguage === "hebrew" 
                  ? "תאר את מראה הדמות הראשית (צבע שיער, סגנון לבוש וכו)" 
                  : "Describe the main character's appearance (hair color, clothing style, etc.)"}
                className="h-20"
              />
            </div>
            
            <div>
              <Label className="font-medium mb-1 block">
                {currentLanguage === "hebrew" 
                  ? "דמויות משניות" 
                  : "Secondary Characters"}
              </Label>
              {characterConsistency.secondaryCharacters.map((char, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input
                    value={char.name}
                    onChange={(e) => {
                      const updated = [...characterConsistency.secondaryCharacters];
                      updated[index].name = e.target.value;
                      setCharacterConsistency({
                        ...characterConsistency,
                        secondaryCharacters: updated
                      });
                    }}
                    placeholder={currentLanguage === "hebrew" ? "שם" : "Name"}
                    className="w-1/3"
                  />
                  <Input
                    value={char.description}
                    onChange={(e) => {
                      const updated = [...characterConsistency.secondaryCharacters];
                      updated[index].description = e.target.value;
                      setCharacterConsistency({
                        ...characterConsistency,
                        secondaryCharacters: updated
                      });
                    }}
                    placeholder={currentLanguage === "hebrew" ? "תיאור קצר" : "Brief description"}
                    className="flex-1"
                  />
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCharacterConsistency({
                  ...characterConsistency,
                  secondaryCharacters: [
                    ...characterConsistency.secondaryCharacters,
                    { name: "", description: "" }
                  ]
                })}
                className="mt-2"
              >
                {currentLanguage === "hebrew" ? "הוסף דמות" : "Add Character"}
              </Button>
            </div>
            
            <div>
              <Label htmlFor="artStyle" className="font-medium mb-1 block">
                {currentLanguage === "hebrew" ? "עקביות סגנון אמנותי" : "Art Style Consistency"}
              </Label>
              <Select
                value={characterConsistency.style}
                onValueChange={(value) => setCharacterConsistency({
                  ...characterConsistency,
                  style: value
                })}
              >
                <SelectTrigger id="artStyle">
                  <SelectValue placeholder={currentLanguage === "hebrew" ? "בחר סגנון אמנותי" : "Select art style"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="disney">{currentLanguage === "hebrew" ? "אנימציית דיסני" : "Disney Animation"}</SelectItem>
                  <SelectItem value="pixar">{currentLanguage === "hebrew" ? "תלת מימד פיקסאר" : "Pixar 3D"}</SelectItem>
                  <SelectItem value="watercolor">{currentLanguage === "hebrew" ? "ציור בצבעי מים" : "Watercolor Painting"}</SelectItem>
                  <SelectItem value="sketch">{currentLanguage === "hebrew" ? "רישום בעיפרון" : "Pencil Sketch"}</SelectItem>
                  <SelectItem value="cartoon">{currentLanguage === "hebrew" ? "קומיקס צבעוני" : "Bright Cartoon"}</SelectItem>
                  <SelectItem value="realistic">{currentLanguage === "hebrew" ? "מציאותי למחצה" : "Semi-Realistic"}</SelectItem>
                  <SelectItem value="anime">{currentLanguage === "hebrew" ? "אנימה/מנגה" : "Anime/Manga"}</SelectItem>
                  <SelectItem value="minimalist">{currentLanguage === "hebrew" ? "מינימליסטי" : "Minimalist"}</SelectItem>
                  <SelectItem value="vintage">{currentLanguage === "hebrew" ? "וינטג'" : "Vintage"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-purple-500" />
              {currentLanguage === "hebrew" ? "אפשרויות חריזה" : "Rhyming Options"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex items-center justify-between">
              <Label htmlFor="use-rhyming" className="font-medium">{currentLanguage === "hebrew" ? "אפשר חריזה" : "Enable Rhyming"}</Label>
              <Switch 
                id="use-rhyming" 
                checked={useRhyming}
                onCheckedChange={setUseRhyming}
              />
            </div>
            
            {useRhyming && (
              <RhymeOptions 
                rhymeSettings={rhymeSettings}
                setRhymeSettings={setRhymeSettings}
                currentLanguage={currentLanguage}
              />
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-8 flex justify-end">
        <Button
          onClick={generateBook}
          disabled={isGenerating}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
        >
          {isGenerating ? (
            <>
              <RotateCw className="h-5 w-5 animate-spin mr-2" />
              {currentLanguage === "hebrew" ? "מייצר..." : "Generating..."}
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5 mr-2" />
              {currentLanguage === "hebrew" ? "צור את הספר שלי" : "Generate My Book"}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// Helper functions for translations
function translateGenre(genre) {
  const genreTranslations = {
    adventure: "הרפתקאות",
    fairy_tale: "אגדה",
    educational: "חינוכי",
    bedtime: "לפני השינה",
    fantasy: "פנטזיה",
    science: "מדע",
    animals: "חיות",
    sports: "ספורט"
  };
  
  return genreTranslations[genre] || genre.replace(/_/g, ' ');
}

function translateArtStyle(style) {
  const styleTranslations = {
    disney: "דיסני",
    pixar: "פיקסאר",
    watercolor: "צבעי מים",
    sketch: "רישום עיפרון",
    cartoon: "קומיקס",
    realistic: "מציאותי למחצה",
    anime: "אנימה",
    clay: "חימר",
    popup: "פופ-אפ",
    minimalist: "מינימליסטי",
    vintage: "וינטג'",
    cultural: "עממי"
  };
  
  return styleTranslations[style] || style.replace(/_/g, ' ');
}
