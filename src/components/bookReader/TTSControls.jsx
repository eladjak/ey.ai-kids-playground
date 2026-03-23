import React from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Square, Minus, Plus } from "lucide-react";
import { useI18n } from "@/components/i18n/i18nProvider";

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
  isRTL
}) {
  const { t } = useI18n();

  const speedLabel = rate === 0.5
    ? t("bookView.tts.slow")
    : rate === 1
      ? t("bookView.tts.normal")
      : t("bookView.tts.fast");

  return (
    <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
      {/* Play / Pause */}
      {!isSpeaking ? (
        <Button
          variant="outline"
          size="sm"
          onClick={onPlay}
          className="gap-1.5"
          aria-label={t("bookView.tts.readAloud")}
        >
          <Play className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="text-xs">{t("bookView.tts.read")}</span>
        </Button>
      ) : isPaused ? (
        <Button
          variant="outline"
          size="sm"
          onClick={onResume}
          className="gap-1.5"
          aria-label={t("bookView.tts.resume")}
        >
          <Play className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="text-xs">{t("bookView.tts.resume")}</span>
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={onPause}
          className="gap-1.5"
          aria-label={t("bookView.tts.pause")}
        >
          <Pause className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="text-xs">{t("bookView.tts.pause")}</span>
        </Button>
      )}

      {/* Stop */}
      {isSpeaking && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onStop}
          aria-label={t("bookView.tts.stop")}
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
          aria-label={t("bookView.tts.slower")}
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
          aria-label={t("bookView.tts.faster")}
        >
          <Plus className="h-3 w-3" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
