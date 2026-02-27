import React from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Square, Minus, Plus } from "lucide-react";

/**
 * TTSControls - Text-to-Speech play/pause/stop controls with speed adjustment.
 */
export default function TTSControls({
  isSpeaking,
  isPaused,
  rate,
  onPlay,
  onPause,
  onResume,
  onStop,
  onRateChange,
  isRTL,
  isHebrew
}) {
  const speedLabel = rate === 0.5
    ? (isHebrew ? "איטי" : "Slow")
    : rate === 1
      ? (isHebrew ? "רגיל" : "Normal")
      : (isHebrew ? "מהיר" : "Fast");

  return (
    <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
      {/* Play / Pause */}
      {!isSpeaking ? (
        <Button
          variant="outline"
          size="sm"
          onClick={onPlay}
          className="gap-1.5"
          aria-label={isHebrew ? "הקרא בקול" : "Read aloud"}
        >
          <Play className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="text-xs">{isHebrew ? "הקרא" : "Read"}</span>
        </Button>
      ) : isPaused ? (
        <Button
          variant="outline"
          size="sm"
          onClick={onResume}
          className="gap-1.5"
          aria-label={isHebrew ? "המשך" : "Resume"}
        >
          <Play className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="text-xs">{isHebrew ? "המשך" : "Resume"}</span>
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={onPause}
          className="gap-1.5"
          aria-label={isHebrew ? "השהה" : "Pause"}
        >
          <Pause className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="text-xs">{isHebrew ? "השהה" : "Pause"}</span>
        </Button>
      )}

      {/* Stop */}
      {isSpeaking && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onStop}
          aria-label={isHebrew ? "עצור" : "Stop"}
        >
          <Square className="h-3.5 w-3.5" aria-hidden="true" />
        </Button>
      )}

      {/* Speed control */}
      <div className={`flex items-center gap-1 ${isRTL ? "flex-row-reverse" : ""}`}>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => onRateChange(Math.max(0.5, rate - 0.25))}
          disabled={rate <= 0.5}
          aria-label={isHebrew ? "האט" : "Slower"}
        >
          <Minus className="h-3 w-3" aria-hidden="true" />
        </Button>
        <span className="text-xs text-gray-500 dark:text-gray-400 min-w-[40px] text-center">
          {speedLabel}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => onRateChange(Math.min(2, rate + 0.25))}
          disabled={rate >= 2}
          aria-label={isHebrew ? "מהר" : "Faster"}
        >
          <Plus className="h-3 w-3" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
