import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BookOpen, 
  Sparkles, 
  Layout, 
  Users, 
  Plus,
  Wand2,
  Eye,
  ArrowRight,
  Clock,
  Target,
  TrendingUp,
  Heart,
  Settings,
  ListOrdered
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import SceneCard from './SceneCard';
import { GenerateImage, InvokeLLM } from '@/integrations/Core';
import { useToast } from '@/components/ui/use-toast';

export default function StoryStructureBuilder({ 
  bookData, 
  updateBookData, 
  currentLanguage = 'english',
  isRTL = false 
}) {
  const { toast } = useToast();
  const [scenes, setScenes] = useState([]);
  const [isGeneratingStructure, setIsGeneratingStructure] = useState(false);
  const [activeTab, setActiveTab] = useState('story');
  const [structureGenerated, setStructureGenerated] = useState(false);

  const translations = {
    english: {
      'builder.title': 'Story Structure Builder',
      'builder.subtitle': 'Transform your story ideas into structured scenes',
      'builder.generate': 'Generate Story Structure',
      'builder.regenerate': 'Regenerate Structure',
      'builder.generating': 'Creating your story structure...',
      'builder.tabs.story': 'Story Details',
      'builder.tabs.scenes': 'Scene Overview',
      'builder.tabs.settings': 'Story Settings',
      'builder.scenes.count': 'scenes',
      'builder.progress.analyzing': 'Analyzing your story elements...',
      'builder.progress.structure': 'Building story structure...',
      'builder.progress.scenes': 'Creating detailed scenes...',
      'builder.progress.complete': 'Story structure ready!',
      'builder.noScenes': 'No scenes generated yet',
      'builder.noScenes.desc': 'Click the button above to generate your story structure',
      'scene.title': 'Scene',
      'scene.edit': 'Edit Scene',
      'scene.view': 'View Scene',
      'scene.pacing.slow': 'Slow',
      'scene.pacing.medium': 'Medium',
      'scene.pacing.fast': 'Fast',
      'story.moral': 'Moral Lesson',
      'story.moral.placeholder': 'What lesson should this story teach?',
      'story.characterDev': 'Character Development',
      'story.characterDev.placeholder': 'How should the characters grow and change?',
      'story.plotPoints': 'Plot Points',
      'story.addPoint': 'Add Plot Point',
      'story.dragToReorder': 'Drag to reorder plot points',
      'settings.title': 'Story Settings',
      'settings.genres': 'Genres',
      'settings.tone': 'Story Tone',
      'settings.length': 'Story Length',
      'settings.ageRange': 'Age Range'
    },
    hebrew: {
      'builder.title': 'בונה מבנה הסיפור',
      'builder.subtitle': 'הפוך את רעיונות הסיפור שלך למבנה סצנות מובנה',
      'builder.generate': 'צור מבנה סיפור',
      'builder.regenerate': 'צור מבנה מחדש',
      'builder.generating': 'יוצר את מבנה הסיפור שלך...',
      'builder.tabs.story': 'פרטי הסיפור',
      'builder.tabs.scenes': 'סקירת סצנות',
      'builder.tabs.settings': 'הגדרות סיפור',
      'builder.scenes.count': 'סצנות',
      'builder.progress.analyzing': 'מנתח את רכיבי הסיפור שלך...',
      'builder.progress.structure': 'בונה מבנה סיפור...',
      'builder.progress.scenes': 'יוצר סצנות מפורטות...',
      'builder.progress.complete': 'מבנה הסיפור מוכן!',
      'builder.noScenes': 'עדיין לא נוצרו סצנות',
      'builder.noScenes.desc': 'לחץ על הכפתור למעלה כדי ליצור את מבנה הסיפור',
      'scene.title': 'סצנה',
      'scene.edit': 'ערוך סצנה',
      'scene.view': 'צפה בסצנה',
      'scene.pacing.slow': 'איטי',
      'scene.pacing.medium': 'בינוני',
      'scene.pacing.fast': 'מהיר',
      'story.moral': 'מוסר השכל',
      'story.moral.placeholder': 'איזה לקח צריך הסיפור הזה ללמד?',
      'story.characterDev': 'פיתוח דמויות',
      'story.characterDev.placeholder': 'איך הדמויות צריכות לגדול ולהשתנות?',
      'story.plotPoints': 'נקודות עלילה',
      'story.addPoint': 'הוסף נקודת עלילה',
      'story.dragToReorder': 'גרור כדי לשנות סדר',
      'settings.title': 'הגדרות סיפור',
      'settings.genres': 'ז\'אנרים',
      'settings.tone': 'טון הסיפור',
      'settings.length': 'אורך הסיפור',
      'settings.ageRange': 'טווח גילאים'
    }
  };

  const t = (key) => translations[currentLanguage]?.[key] || translations.english[key] || key;

  // Scene sketch generation queue - SEPARATE from avatar queue
  const sceneSketchQueue = useRef([]);
  const isProcessingSceneQueue = useRef(false);

  const processSceneSketchQueue = async () => {
    if (isProcessingSceneQueue.current || sceneSketchQueue.current.length === 0) return;
    
    isProcessingSceneQueue.current = true;
    
    while (sceneSketchQueue.current.length > 0) {
      const { scene, retryCount = 0 } = sceneSketchQueue.current.shift();
      
      try {
        await generateSketchInternal(scene);
        // Wait 4 seconds between scene generations (longer than avatars)
        await new Promise(resolve => setTimeout(resolve, 4000));
      } catch (error) {
        if (error.message?.includes('429') && retryCount < 3) {
          sceneSketchQueue.current.push({ scene, retryCount: retryCount + 1 });
          // Wait even longer for retries
          await new Promise(resolve => setTimeout(resolve, 10000 * (retryCount + 1)));
        } else {
          console.error(`Failed to generate sketch for scene ${scene.id} after retries:`, error);
        }
      }
    }
    
    isProcessingSceneQueue.current = false;
  };

  const handleGenerateSketch = (sceneToUpdate) => {
    if (!sceneSketchQueue.current.some(item => item.scene?.id === sceneToUpdate.id)) {
      sceneSketchQueue.current.push({ scene: sceneToUpdate });
      processSceneSketchQueue();
    }
  };

  const generateSketchInternal = async (sceneToUpdate) => {
    try {
      const characters = sceneToUpdate.characters?.join(', ') || 'main character';
      const artStyle = bookData.art_style || 'cartoon';
      const language = bookData.language || currentLanguage;
      const isHebrew = language === 'hebrew';
      
      let prompt = '';
      if (isHebrew) {
        prompt = `איור לספר ילדים בסגנון ${artStyle}. 
        סצנה: "${sceneToUpdate.description}". 
        מיקום: ${sceneToUpdate.location || 'לא צוין'}. 
        דמויות: ${characters}. 
        מצב רוח: ${sceneToUpdate.mood || 'חיובי'}. 
        סגנון פשוט, נקי וידידותי לילדים. ללא טקסט בתמונה.
        איור מלא של הסצנה, לא פורטרט של דמות.`;
      } else {
        prompt = `Children's book illustration in ${artStyle} style. 
        Scene: "${sceneToUpdate.description}". 
        Location: ${sceneToUpdate.location || 'unspecified'}. 
        Characters: ${characters}. 
        Mood: ${sceneToUpdate.mood || 'positive'}. 
        Simple, clean, child-friendly style. No text in image.
        Full scene illustration, not character portrait.`;
      }

      // Use Gemini 3 Pro Nano Banana as default for scene sketches
      const result = await GenerateImage({ 
        prompt,
        model: 'gemini-3-pro-nano-banana'
      });
      
      if (result && result.url) {
        const updatedScenes = scenes.map(s => 
          s.id === sceneToUpdate.id ? { ...s, sketch_url: result.url } : s
        );
        setScenes(updatedScenes);
        updateBookData('scenes', updatedScenes);
        
        toast({ 
          title: isHebrew ? "סקיצה נוצרה!" : "Sketch Generated!", 
          description: isHebrew ? `תמונה עבור "${sceneToUpdate.title}" מוכנה.` : `Visual for "${sceneToUpdate.title}" is ready.`,
          className: "bg-green-100 text-green-900 dark:bg-green-900/50 dark:text-green-100"
        });
      } else {
        throw new Error("Image generation failed to return a URL.");
      }
    } catch (e) {
      console.error("Error generating sketch:", e);
      throw e;
    }
  };

  // Load scenes from bookData
  useEffect(() => {
    if (bookData.scenes && bookData.scenes.length > 0) {
      setScenes(bookData.scenes);
      setStructureGenerated(true);
      
      // Queue scenes that need sketches (but DON'T auto-generate on load)
      // User can manually trigger sketch generation per scene
    } else if (bookData.plot_points && bookData.plot_points.length > 0 && scenes.length === 0) {
      // Auto-generate initial scenes from plot points
      const basicScenes = bookData.plot_points.map((point, index) => ({
        id: `scene-${Date.now()}-${index}`,
        title: `${t('scene.title')} ${index + 1}`,
        description: point,
        content: point,
        pacing: 'medium',
        characters: bookData.selectedCharacters?.map(c => c.name) || [],
        location: '',
        environment: '',
        sketch_url: null // User will manually generate sketches
      }));
      setScenes(basicScenes);
      updateBookData('scenes', basicScenes);
      setStructureGenerated(true);
    }
  }, [bookData.plot_points, bookData.scenes, bookData.selectedCharacters, currentLanguage]);

  // ... keep rest of existing code unchanged
}