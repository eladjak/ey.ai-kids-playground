import React, { useState, useEffect, useRef } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { 
  Volume2, 
  VolumeX, 
  PlayCircle, 
  PauseCircle, 
  Save, 
  SkipBack, 
  SkipForward,
  Upload,
  Mic,
  Music,
  Wand2,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function NarrationManager({ page, bookLanguage, onSaveAudio }) {
  const { toast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [previewAudio, setPreviewAudio] = useState(null);
  const [backgroundMusic, setBackgroundMusic] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState("english");
  const [isRTL, setIsRTL] = useState(false);
  
  const audioRef = useRef(null);
  const recordingRef = useRef(null);
  const recordingTimerRef = useRef(null);
  
  // Load language on component mount
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
  
  // Create translations object
  const translations = {
    english: {
      "narration.title": "Narration Manager",
      "narration.description": "Add voice narration to your story",
      "narration.generate": "Generate Narration",
      "narration.generating": "Generating...",
      "narration.record": "Record Narration",
      "narration.recording": "Recording...",
      "narration.stopRecording": "Stop Recording",
      "narration.upload": "Upload Audio",
      "narration.save": "Save",
      "narration.preview": "Preview",
      "narration.discard": "Discard",
      "narration.options": "Audio Options",
      "narration.backgroundMusic": "Background Music",
      "narration.autoPlay": "Auto-play on page",
      "narration.volume": "Volume",
      "narration.controls": "Playback Controls",
      "narration.currentAudio": "Current Audio",
      "narration.noAudio": "No audio narration available"
    },
    hebrew: {
      "narration.title": "ניהול הקראה",
      "narration.description": "הוסף הקראה קולית לסיפור שלך",
      "narration.generate": "צור הקראה",
      "narration.generating": "יוצר הקראה...",
      "narration.record": "הקלט הקראה",
      "narration.recording": "מקליט...",
      "narration.stopRecording": "עצור הקלטה",
      "narration.upload": "העלה שמע",
      "narration.save": "שמור",
      "narration.preview": "תצוגה מקדימה",
      "narration.discard": "התעלם",
      "narration.options": "אפשרויות שמע",
      "narration.backgroundMusic": "מוזיקת רקע",
      "narration.autoPlay": "ניגון אוטומטי בעמוד",
      "narration.volume": "עוצמת קול",
      "narration.controls": "בקרי השמעה",
      "narration.currentAudio": "שמע נוכחי",
      "narration.noAudio": "אין הקראה קולית זמינה"
    }
  };
  
  // Translation function
  const t = (key) => {
    return translations[currentLanguage]?.[key] || translations.english[key] || key;
  };
  
  useEffect(() => {
    // If page changes, update audio
    if (page?.audio_url) {
      setPreviewAudio(page.audio_url);
      setShowControls(true);
      if (audioRef.current) {
        audioRef.current.load();
      }
    } else {
      setPreviewAudio(null);
      setShowControls(false);
    }
  }, [page]);
  
  useEffect(() => {
    // Set up audio event listeners
    if (audioRef.current) {
      audioRef.current.addEventListener('timeupdate', updateProgress);
      audioRef.current.addEventListener('loadedmetadata', updateDuration);
      audioRef.current.addEventListener('ended', handleAudioEnd);
      
      // Apply volume and mute settings
      audioRef.current.volume = volume / 100;
      audioRef.current.muted = isMuted;
      
      // Clean up
      return () => {
        audioRef.current?.removeEventListener('timeupdate', updateProgress);
        audioRef.current?.removeEventListener('loadedmetadata', updateDuration);
        audioRef.current?.removeEventListener('ended', handleAudioEnd);
      };
    }
  }, [previewAudio]);
  
  // Handle volume and mute changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
      audioRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);
  
  // Format time display (MM:SS)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };
  
  // Update progress bar and current time
  const updateProgress = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };
  
  // Update total duration when audio is loaded
  const updateDuration = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };
  
  // Handle audio end
  const handleAudioEnd = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };
  
  // Handle play/pause toggle
  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  // Handle progress bar click/drag
  const handleProgressChange = (newValue) => {
    if (audioRef.current) {
      const seekTime = (newValue[0] / 100) * duration;
      audioRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };
  
  // Handle volume change
  const handleVolumeChange = (newValue) => {
    setVolume(newValue[0]);
    if (isMuted && newValue[0] > 0) {
      setIsMuted(false);
    }
  };
  
  // Handle mute toggle
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };
  
  // Generate narration using AI
  const generateNarration = async () => {
    if (!page?.text_content) {
      toast({
        variant: "destructive",
        description: currentLanguage === "hebrew" 
          ? "אין תוכן טקסט להקראה"
          : "No text content to narrate",
      });
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // Simulate API call to generate narration
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For demo purposes, we'll use a placeholder audio URL
      const generatedAudioUrl = "https://example.com/generated-audio.mp3";
      
      setPreviewAudio(generatedAudioUrl);
      setShowControls(true);
      
      toast({
        description: currentLanguage === "hebrew" 
          ? "הקראה נוצרה בהצלחה"
          : "Narration generated successfully",
        className: "bg-green-100 text-green-900 dark:bg-green-900/50 dark:text-green-100"
      });
    } catch (error) {
      console.error("Error generating narration:", error);
      toast({
        variant: "destructive",
        description: currentLanguage === "hebrew" 
          ? "שגיאה ביצירת הקראה"
          : "Error generating narration",
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Start recording narration
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(blob);
        setRecordedBlob(blob);
        setPreviewAudio(audioUrl);
        setShowControls(true);
      };
      
      mediaRecorder.start();
      recordingRef.current = mediaRecorder;
      setIsRecording(true);
      
      // Start recording timer
      let seconds = 0;
      recordingTimerRef.current = setInterval(() => {
        seconds += 1;
        setRecordingTime(seconds);
      }, 1000);
      
    } catch (error) {
      console.error("Error starting recording:", error);
      toast({
        variant: "destructive",
        description: currentLanguage === "hebrew" 
          ? "שגיאה בהקלטה. בדוק אם המיקרופון זמין."
          : "Recording error. Check if microphone is available.",
      });
    }
  };
  
  // Stop recording
  const stopRecording = () => {
    if (recordingRef.current) {
      recordingRef.current.stop();
      recordingRef.current.stream.getTracks().forEach(track => track.stop());
      recordingRef.current = null;
    }
    
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    
    setIsRecording(false);
    setRecordingTime(0);
  };
  
  // Upload audio file
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const audioUrl = URL.createObjectURL(file);
      setPreviewAudio(audioUrl);
      setShowControls(true);
      
      toast({
        description: currentLanguage === "hebrew" 
          ? "קובץ שמע הועלה בהצלחה"
          : "Audio file uploaded successfully",
        className: "bg-green-100 text-green-900 dark:bg-green-900/50 dark:text-green-100"
      });
    }
  };
  
  // Save narration
  const saveNarration = () => {
    if (onSaveAudio && previewAudio) {
      onSaveAudio(previewAudio, {
        backgroundMusic,
        autoPlay
      });
      
      toast({
        description: currentLanguage === "hebrew" 
          ? "הקראה נשמרה בהצלחה"
          : "Narration saved successfully",
        className: "bg-green-100 text-green-900 dark:bg-green-900/50 dark:text-green-100"
      });
    }
  };
  
  // Discard preview
  const discardPreview = () => {
    setPreviewAudio(null);
    setShowControls(false);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setRecordedBlob(null);
  };
  
  return (
    <Card dir={isRTL ? "rtl" : "ltr"}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="h-5 w-5 text-purple-500" />
          {t("narration.title")}
        </CardTitle>
        <CardDescription>
          {t("narration.description")}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {page ? (
          <>
            {!showControls ? (
              <div className="space-y-4">
                <Button
                  onClick={generateNarration}
                  disabled={isGenerating || !page.text_content}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      {t("narration.generating")}
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4 mr-2" />
                      {t("narration.generate")}
                    </>
                  )}
                </Button>
                
                <div className="flex items-center gap-2">
                  <div className="border-t border-gray-200 dark:border-gray-700 flex-grow"></div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {t("OR", currentLanguage === "hebrew" ? "או" : "OR")}
                  </span>
                  <div className="border-t border-gray-200 dark:border-gray-700 flex-grow"></div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={isRecording ? stopRecording : startRecording}
                    variant={isRecording ? "destructive" : "outline"}
                    className="w-full"
                  >
                    {isRecording ? (
                      <>
                        <div className="mr-2 h-2 w-2 rounded-full bg-red-500 animate-pulse"></div>
                        {t("narration.recording")} ({formatTime(recordingTime)})
                      </>
                    ) : (
                      <>
                        <Mic className="h-4 w-4 mr-2" />
                        {t("narration.record")}
                      </>
                    )}
                  </Button>
                  
                  <div className="relative">
                    <input
                      type="file"
                      id="audio-upload"
                      accept="audio/*"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={handleFileUpload}
                    />
                    <Button variant="outline" className="w-full">
                      <Upload className="h-4 w-4 mr-2" />
                      {t("narration.upload")}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <audio ref={audioRef} src={previewAudio} className="hidden" />
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">
                      {t("narration.currentAudio")}
                    </h3>
                    
                    <div className="flex items-center gap-3">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={togglePlayPause}
                        className="h-9 w-9 rounded-full bg-white dark:bg-gray-700 shadow-sm hover:bg-gray-100 dark:hover:bg-gray-600"
                      >
                        {isPlaying ? (
                          <PauseCircle className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                        ) : (
                          <PlayCircle className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                        )}
                      </Button>
                      
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span>{formatTime(currentTime)}</span>
                          <span>{formatTime(duration)}</span>
                        </div>
                        
                        <Slider
                          value={[duration ? (currentTime / duration) * 100 : 0]}
                          onValueChange={handleProgressChange}
                          className="cursor-pointer"
                        />
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleMute}
                        className="h-8 w-8"
                      >
                        {isMuted ? (
                          <VolumeX className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                        ) : (
                          <Volume2 className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-sm font-medium">
                    {t("narration.options")}
                  </h3>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Music className="h-4 w-4 text-gray-500" />
                        <Label>{t("narration.backgroundMusic")}</Label>
                      </div>
                      <Switch
                        checked={backgroundMusic}
                        onCheckedChange={setBackgroundMusic}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <PlayCircle className="h-4 w-4 text-gray-500" />
                        <Label>{t("narration.autoPlay")}</Label>
                      </div>
                      <Switch
                        checked={autoPlay}
                        onCheckedChange={setAutoPlay}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>{t("narration.volume")}</Label>
                        <span className="text-sm text-gray-500">{volume}%</span>
                      </div>
                      <Slider
                        value={[volume]}
                        onValueChange={handleVolumeChange}
                        max={100}
                        step={1}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={discardPreview}
                    className="flex-1"
                  >
                    {t("narration.discard")}
                  </Button>
                  
                  <Button
                    onClick={saveNarration}
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {t("narration.save")}
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center text-gray-500">
            <Volume2 className="h-12 w-12 mb-4 text-gray-300" />
            <p className="mb-2">{t("narration.noAudio")}</p>
            <p className="text-sm">
              {currentLanguage === "hebrew" 
                ? "בחר עמוד כדי לנהל את ההקראה שלו"
                : "Select a page to manage its narration"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}