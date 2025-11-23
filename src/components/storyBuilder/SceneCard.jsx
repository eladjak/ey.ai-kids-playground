import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  Eye, 
  Edit, 
  Sparkles, 
  Users, 
  MapPin, 
  Clock,
  Loader2,
  GripVertical
} from 'lucide-react';

export default function SceneCard({ 
  scene, 
  sceneIndex, 
  onEdit, 
  onGenerateSketch, 
  onViewFull, 
  isDragging = false,
  currentLanguage = 'english',
  isRTL = false,
  t // Pass translation function as a prop
}) {
  const [isGeneratingSketch, setIsGeneratingSketch] = useState(false);

  const handleGenerateSketch = async () => {
    setIsGeneratingSketch(true);
    try {
      await onGenerateSketch(scene); // Pass the whole scene object
    } catch (error) {
      console.error('Error generating sketch:', error);
    } finally {
      setIsGeneratingSketch(false);
    }
  };

  const getPacingColor = (pacing) => {
    switch (pacing) {
      case 'slow': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'fast': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };
  
  const translatePacing = (pacing) => {
    const key = `scene.pacing.${pacing}`;
    return t(key);
  }

  return (
    <TooltipProvider delayDuration={100}>
      <Card 
        className={`transition-all duration-200 hover:shadow-lg ${
          isDragging ? 'rotate-2 shadow-xl' : ''
        } ${isRTL ? 'text-right' : 'text-left'}`}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <CardHeader className="pb-3">
          <div className={`flex items-start justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <GripVertical className="h-4 w-4 text-gray-400 cursor-grab" />
              <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                {sceneIndex + 1}
              </div>
            </div>
            <div className={`flex gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(scene)}
                    className="h-8 w-8 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                  >
                    <Edit className="h-4 w-4 text-blue-600" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t('scene.edit')}</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onViewFull(scene)}
                    className="h-8 w-8 hover:bg-green-100 dark:hover:bg-green-900/30"
                  >
                    <Eye className="h-4 w-4 text-green-600" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t('scene.view')}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          <CardTitle className="text-lg leading-tight mt-2">
            {scene.title || `${t('scene.title')} ${sceneIndex + 1}`}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Scene Sketch/Visual */}
          <div className="relative">
            {scene.sketch_url ? (
              <img
                src={scene.sketch_url}
                alt={`${t('scene.title')} ${sceneIndex + 1} sketch`}
                className="w-full h-32 object-cover rounded-lg border"
              />
            ) : (
              <div className="w-full h-32 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-dashed border-purple-300 dark:border-purple-700 flex items-center justify-center">
                 <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        onClick={handleGenerateSketch}
                        disabled={isGeneratingSketch}
                        className="text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30"
                      >
                        {isGeneratingSketch ? (
                          <Loader2 className={`h-4 w-4 animate-spin ${isRTL ? 'ml-2' : 'mr-2'}`} />
                        ) : (
                          <Sparkles className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                        )}
                        {currentLanguage === 'hebrew' ? 'צור סקיצה' : 'Generate Sketch'}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{currentLanguage === 'hebrew' ? 'צור תמונה מהירה של הסצנה' : 'Create a quick visual for the scene'}</p>
                    </TooltipContent>
                  </Tooltip>
              </div>
            )}
          </div>

          {/* Scene Description */}
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
            {scene.description || scene.content}
          </p>

          {/* Scene Details */}
          <div className="space-y-2">
            {/* Location */}
            {scene.location && (
              <div className={`flex items-center gap-2 text-xs ${isRTL ? 'flex-row-reverse' : ''}`}>
                <MapPin className="h-3 w-3 text-gray-500" />
                <span className="text-gray-600 dark:text-gray-400">{scene.location}</span>
              </div>
            )}

            {/* Characters */}
            {scene.characters && scene.characters.length > 0 && (
              <div className={`flex items-center gap-2 text-xs ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Users className="h-3 w-3 text-gray-500" />
                <div className={`flex gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  {scene.characters.slice(0, 3).map((character, idx) => (
                    <Avatar key={idx} className="h-5 w-5">
                      <AvatarFallback className="text-[8px] bg-purple-100 text-purple-700">
                        {typeof character === 'string' ? character[0] : character.name?.[0] || '?'}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {scene.characters.length > 3 && (
                    <span className="text-gray-500 text-[10px] self-center">
                      +{scene.characters.length - 3}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Pacing */}
            {scene.pacing && (
              <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Clock className="h-3 w-3 text-gray-500" />
                <Badge variant="secondary" className={`text-[10px] px-2 py-0.5 ${getPacingColor(scene.pacing)}`}>
                  {translatePacing(scene.pacing)}
                </Badge>
              </div>
            )}
          </div>

          {/* Key Action or Dialogue */}
          {(scene.key_action || scene.dialogue) && (
            <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
              <p className="text-xs italic text-gray-500 dark:text-gray-400 line-clamp-2">
                {scene.key_action && `"${scene.key_action}"`}
                {scene.dialogue && `💬 "${scene.dialogue}"`}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}