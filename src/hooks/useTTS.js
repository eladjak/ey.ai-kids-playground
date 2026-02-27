import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook for Text-to-Speech narration with language-aware voice selection.
 * Uses the Web Speech API (speechSynthesis).
 *
 * @param {Object} options
 * @param {string} options.language - 'english' | 'hebrew' | 'yiddish'
 * @returns {{ speak, stop, pause, resume, isSpeaking, isPaused, currentWordIndex, rate, setRate }}
 */
export function useTTS({ language = 'english' } = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [rate, setRate] = useState(1);
  const utteranceRef = useRef(null);
  const wordsRef = useRef([]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  // Get the best available voice for the language
  const getVoice = useCallback(() => {
    const voices = window.speechSynthesis?.getVoices() || [];

    const langMap = {
      hebrew: ['he', 'he-IL', 'iw'],
      yiddish: ['yi', 'he', 'he-IL'],
      english: ['en', 'en-US', 'en-GB']
    };

    const langCodes = langMap[language] || langMap.english;

    for (const code of langCodes) {
      const voice = voices.find(v => v.lang.startsWith(code));
      if (voice) return voice;
    }

    return voices[0] || null;
  }, [language]);

  const speak = useCallback((text) => {
    if (!window.speechSynthesis || !text) return;

    window.speechSynthesis.cancel();
    setCurrentWordIndex(-1);

    const words = text.split(/\s+/).filter(Boolean);
    wordsRef.current = words;

    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;

    const voice = getVoice();
    if (voice) utterance.voice = voice;

    utterance.rate = rate;
    utterance.pitch = 1;

    // Word boundary events for highlight-as-you-read
    let charIndex = 0;
    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        // Map character index to word index
        const textBefore = text.substring(0, event.charIndex);
        const wordIndex = textBefore.split(/\s+/).filter(Boolean).length;
        setCurrentWordIndex(wordIndex);
      }
    };

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      setCurrentWordIndex(-1);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      setCurrentWordIndex(-1);
    };

    window.speechSynthesis.speak(utterance);
  }, [getVoice, rate]);

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
    setCurrentWordIndex(-1);
  }, []);

  const pause = useCallback(() => {
    window.speechSynthesis?.pause();
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    window.speechSynthesis?.resume();
    setIsPaused(false);
  }, []);

  return {
    speak,
    stop,
    pause,
    resume,
    isSpeaking,
    isPaused,
    currentWordIndex,
    rate,
    setRate
  };
}
