import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { Book } from "@/entities/Book";
import { Page } from "@/entities/Page";
import { createPageUrl } from "@/utils";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useI18n } from "@/components/i18n/i18nProvider";
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Home,
  Download,
  Maximize,
  Minimize,
  Moon,
  Sun,
  ZoomIn,
  ZoomOut,
  Loader2,
  PenTool,
  BookOpen,
  Share2,
  Plus,
  LogIn
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import PageFlip from "@/components/bookReader/PageFlip";
import TTSControls from "@/components/bookReader/TTSControls";
import { useTTS } from "@/hooks/useTTS";
import { exportBookToPDF } from "@/utils/pdfExporter";
import useGamification from "@/hooks/useGamification";
import confetti from "canvas-confetti";
import { updateMeta, resetMeta } from "@/lib/seo";
import { useAuth } from "@/lib/AuthContext";

export default function BookView() {
  const { language: i18nLanguage, isRTL: i18nIsRTL } = useI18n();
  const { user } = useCurrentUser();
  const { navigateToLogin } = useAuth();
  const [book, setBook] = useState(null);
  const [pages, setPages] = useState([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [direction, setDirection] = useState(1);
  const [currentLanguage, setCurrentLanguage] = useState(i18nLanguage);

  // Enhanced reader state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [nightMode, setNightMode] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [pdfProgress, setPdfProgress] = useState(0);

  const { toast } = useToast();
  const containerRef = useRef(null);
  const touchStartRef = useRef(null);
  const bookReadAwardedRef = useRef(false); // Tracks whether book_read XP was awarded this session

  // Gamification — only meaningful when logged in, but hook is always called
  const gamification = useGamification();

  // Get book ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const bookId = urlParams.get("id");

  const isRTL = currentLanguage === "hebrew" || currentLanguage === "yiddish";
  const isHebrew = currentLanguage === "hebrew";

  // Whether the viewer is a guest (not logged in)
  const isGuest = !user;

  // TTS hook
  const tts = useTTS({ language: currentLanguage });

  // If there is no bookId at all, stop loading immediately
  useEffect(() => {
    if (!bookId) {
      setLoading(false);
    }
  }, [bookId]);

  // Load book, pages, and restore reading progress
  useEffect(() => {
    if (!bookId) return;

    const loadBook = async () => {
      try {
        setLoading(true);

        // Load user language (fall back to i18n context language)
        // user comes from useCurrentUser hook (null when not logged in)
        const lang = user?.language || i18nLanguage || "english";
        setCurrentLanguage(lang);

        const [bookData, pagesData] = await Promise.all([
          Book.get(bookId),
          Page.filter({ book_id: bookId }, "page_number")
        ]);

        setBook(bookData);
        setPages(pagesData);

        // Restore reading progress
        const savedPage = localStorage.getItem(`book_${bookId}_page`);
        if (savedPage) {
          const pageIdx = parseInt(savedPage, 10);
          if (pageIdx >= 0 && pageIdx < pagesData.length) {
            setCurrentPageIndex(pageIdx);
          }
        }

        // Use book language if available
        if (bookData.language) {
          setCurrentLanguage(bookData.language);
        }

        // SEO meta tags
        updateMeta({
          title: bookData.title,
          description: bookData.description || 'ספר ילדים מאת Sipurai',
          image: bookData.cover_image,
          type: 'article',
        });
      } catch {
        toast({
          variant: "destructive",
          description: "Failed to load book. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };

    loadBook();
  }, [bookId]);

  // Reset SEO meta on unmount
  useEffect(() => {
    return () => resetMeta();
  }, []);

  // Save reading progress
  useEffect(() => {
    if (bookId && pages.length > 0) {
      localStorage.setItem(`book_${bookId}_page`, String(currentPageIndex));
    }
  }, [bookId, currentPageIndex, pages.length]);

  // Stop TTS when changing pages
  useEffect(() => {
    tts.stop();
  }, [currentPageIndex]);

  // Award book_read XP and fire confetti when reaching the last page (once per session)
  // Only award XP to logged-in users
  useEffect(() => {
    if (
      !isGuest &&
      pages.length > 1 &&
      currentPageIndex === pages.length - 1 &&
      !bookReadAwardedRef.current
    ) {
      bookReadAwardedRef.current = true;
      gamification.awardXP("book_read");

      // Confetti celebration
      const duration = 2500;
      const end = Date.now() + duration;
      const celebrate = () => {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 60,
          origin: { x: 0, y: 0.7 },
          colors: ["#9333ea", "#f59e0b", "#10b981", "#6366f1"]
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 60,
          origin: { x: 1, y: 0.7 },
          colors: ["#9333ea", "#f59e0b", "#10b981", "#6366f1"]
        });
        if (Date.now() < end) {
          requestAnimationFrame(celebrate);
        }
      };
      celebrate();
    }
  }, [currentPageIndex, pages.length, isGuest]);

  const currentPage = pages[currentPageIndex];

  // Navigation
  const goToNextPage = useCallback(() => {
    if (currentPageIndex < pages.length - 1) {
      setDirection(1);
      setCurrentPageIndex((prev) => prev + 1);
    }
  }, [currentPageIndex, pages.length]);

  const goToPreviousPage = useCallback(() => {
    if (currentPageIndex > 0) {
      setDirection(-1);
      setCurrentPageIndex((prev) => prev - 1);
    }
  }, [currentPageIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

      switch (e.key) {
        case "ArrowRight":
          isRTL ? goToPreviousPage() : goToNextPage();
          break;
        case "ArrowLeft":
          isRTL ? goToNextPage() : goToPreviousPage();
          break;
        case "Escape":
          if (isFullscreen) toggleFullscreen();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNextPage, goToPreviousPage, isRTL, isFullscreen]);

  // Swipe gesture support
  const handleTouchStart = (e) => {
    touchStartRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartRef.current === null) return;
    const diff = touchStartRef.current - e.changedTouches[0].clientX;
    const threshold = 50;

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        // Swipe left
        isRTL ? goToPreviousPage() : goToNextPage();
      } else {
        // Swipe right
        isRTL ? goToNextPage() : goToPreviousPage();
      }
    }
    touchStartRef.current = null;
  };

  // Fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Zoom
  const zoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 2));
  const zoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.75));

  // PDF export — available to all (guests included)
  const handleExportPDF = async () => {
    if (!book || pages.length === 0) return;
    try {
      setIsExportingPDF(true);
      setPdfProgress(0);
      await exportBookToPDF(book, pages, {
        format: "a4",
        onProgress: (progress) => setPdfProgress(progress)
      });
      toast({
        title: isHebrew ? "הורדה הושלמה!" : "Download complete!",
        description: isHebrew ? "הספר הורד כ-PDF" : "The book was downloaded as PDF",
        className: "bg-green-100 text-green-900 dark:bg-green-900/50 dark:text-green-100"
      });
    } catch {
      toast({
        variant: "destructive",
        description: isHebrew ? "שגיאה ביצוא PDF" : "Failed to export PDF"
      });
    } finally {
      setIsExportingPDF(false);
      setPdfProgress(0);
    }
  };

  // TTS handlers
  const handleTTSPlay = () => {
    const text = currentPage?.text_content;
    if (text) tts.speak(text);
  };

  // Page layout helper
  const getPageLayoutStyle = (layoutType) => {
    switch (layoutType) {
      case "text_top": return "flex-col";
      case "text_bottom": return "flex-col-reverse";
      case "text_left": return "flex-row";
      case "text_right": return "flex-row-reverse";
      default: return "flex-col";
    }
  };

  // Render text with word highlighting for TTS
  const renderHighlightedText = (text) => {
    if (!text) return null;

    if (!tts.isSpeaking || tts.currentWordIndex < 0) {
      return (
        <p className="text-lg md:text-xl leading-relaxed">
          {text}
        </p>
      );
    }

    const words = text.split(/(\s+)/);
    let wordIdx = 0;

    return (
      <p className="text-lg md:text-xl leading-relaxed">
        {words.map((segment, i) => {
          if (/^\s+$/.test(segment)) return segment;

          const isHighlighted = wordIdx === tts.currentWordIndex;
          wordIdx++;

          return (
            <span
              key={i}
              className={isHighlighted
                ? "bg-yellow-200 dark:bg-yellow-700 rounded px-0.5 transition-colors duration-100"
                : "transition-colors duration-100"
              }
            >
              {segment}
            </span>
          );
        })}
      </p>
    );
  };

  // Night mode classes
  const nightBg = nightMode ? "bg-gray-950" : "bg-gray-100 dark:bg-gray-900";
  const nightCard = nightMode ? "bg-gray-900 text-amber-50" : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200";
  const nightHeader = nightMode ? "bg-gray-900 border-gray-800" : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700";
  const nightNav = nightMode ? "bg-gray-900 border-gray-800" : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-300">
            {isHebrew ? "טוען את הספר..." : "Loading book..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`min-h-screen flex flex-col ${nightBg} transition-colors duration-300`}
      dir={isRTL ? "rtl" : "ltr"}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Guest sign-in banner — shown at top for unauthenticated visitors */}
      {isGuest && book && (
        <div className="bg-purple-600 text-white px-4 py-2 flex items-center justify-between gap-3 text-sm">
          <span className={isRTL ? "text-right" : ""}>
            {isHebrew
              ? "קורא כאורח — התחבר כדי ליצור ספרים, לשמור קריאה ולקבל XP"
              : "Reading as guest — sign in to create books, save progress, and earn XP"}
          </span>
          <button
            onClick={() => navigateToLogin()}
            className="shrink-0 flex items-center gap-1.5 bg-white text-purple-700 hover:bg-purple-50 transition-colors px-3 py-1 rounded-full font-medium"
          >
            <LogIn className="h-3.5 w-3.5" aria-hidden="true" />
            {isHebrew ? "התחברות" : "Sign in"}
          </button>
        </div>
      )}

      {/* Header */}
      <header className={`p-3 border-b ${nightHeader} shadow-sm transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
            <Link to={createPageUrl("Library")}>
              <Button variant="ghost" size="icon" aria-label={isHebrew ? "חזרה לספרייה" : "Back to Library"}>
                {isRTL ? <ArrowRight className="h-5 w-5" /> : <ArrowLeft className="h-5 w-5" />}
              </Button>
            </Link>
            <h1 className={`text-lg font-semibold truncate max-w-[200px] md:max-w-none ${nightMode ? "text-amber-50" : "text-gray-900 dark:text-white"}`}>
              {book?.title || (isHebrew ? "צפייה בספר" : "Book Viewer")}
            </h1>
          </div>

          <div className={`flex items-center gap-1 ${isRTL ? "flex-row-reverse" : ""}`}>
            {/* TTS Controls */}
            {currentPageIndex > 0 && currentPage?.text_content && (
              <TTSControls
                isSpeaking={tts.isSpeaking}
                isPaused={tts.isPaused}
                rate={tts.rate}
                onPlay={handleTTSPlay}
                onPause={tts.pause}
                onResume={tts.resume}
                onStop={tts.stop}
                onRateChange={tts.setRate}
                isRTL={isRTL}
                isHebrew={isHebrew}
              />
            )}

            {/* Zoom controls */}
            <Button variant="ghost" size="icon" onClick={zoomOut} disabled={zoomLevel <= 0.75} aria-label="Zoom out">
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={zoomIn} disabled={zoomLevel >= 2} aria-label="Zoom in">
              <ZoomIn className="h-4 w-4" />
            </Button>

            {/* Night mode */}
            <Button variant="ghost" size="icon" onClick={() => setNightMode(!nightMode)} aria-label={isHebrew ? "מצב לילה" : "Night mode"}>
              {nightMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
            </Button>

            {/* Fullscreen */}
            <Button variant="ghost" size="icon" onClick={toggleFullscreen} aria-label={isHebrew ? "מסך מלא" : "Fullscreen"}>
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>

            {/* PDF Export — available to all */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleExportPDF}
              disabled={isExportingPDF}
              aria-label={isHebrew ? "הורד PDF" : "Download PDF"}
            >
              {isExportingPDF ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
            </Button>

            {/* Edit in Advanced Editor — owner only, requires login */}
            {book && !isGuest && book.created_by === user?.email && (
              <Link to={`${createPageUrl("BookCreation")}?id=${book.id}`}>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <PenTool className="h-4 w-4" />
                  {isHebrew ? "ערוך בעורך מתקדם" : "Edit in Advanced Editor"}
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* PDF progress bar */}
        {isExportingPDF && (
          <div className="mt-2 max-w-7xl mx-auto">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div
                className="bg-purple-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${pdfProgress}%` }}
              />
            </div>
          </div>
        )}
      </header>

      {/* Reading progress bar */}
      <div className="h-1 bg-gray-200 dark:bg-gray-700">
        <div
          className="h-1 bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300"
          style={{ width: pages.length > 1 ? `${(currentPageIndex / (pages.length - 1)) * 100}%` : "0%" }}
        />
      </div>

      {/* Book content */}
      <main className="flex-1 flex flex-col">
        {book && pages.length > 0 ? (
          <div className="flex-1 flex flex-col">
            {/* Book viewer */}
            <div className={`flex-1 flex flex-col items-center justify-center p-4 md:p-8 ${nightBg}`}>
              <div
                className="w-full max-w-4xl transition-transform duration-200"
                style={{ transform: `scale(${zoomLevel})`, transformOrigin: "top center" }}
              >
                <PageFlip
                  pageKey={currentPageIndex}
                  direction={direction}
                  isRTL={isRTL}
                >
                  <div className={`${nightCard} rounded-lg shadow-lg overflow-hidden transition-colors duration-300`}>
                    {currentPageIndex === 0 ? (
                      /* Cover page */
                      <div className="aspect-video md:aspect-[3/2] relative overflow-hidden">
                        {book.cover_image ? (
                          <img
                            src={book.cover_image}
                            alt={book.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-r from-purple-400 to-blue-500 flex items-center justify-center">
                            <div className="text-center p-8">
                              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{book.title}</h2>
                              {book.child_name && (
                                <p className="text-xl text-white opacity-80">
                                  {isHebrew ? `סיפור עבור ${book.child_name}` : `A story for ${book.child_name}`}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Regular page */
                      <div className={`min-h-[60vh] flex ${getPageLayoutStyle(currentPage?.layout_type)}`}>
                        {/* Text content */}
                        <div className="p-6 md:p-8 flex-1 flex items-center">
                          <div>
                            {renderHighlightedText(currentPage?.text_content)}
                          </div>
                        </div>

                        {/* Image */}
                        <div className={`flex-1 ${nightMode ? "bg-gray-800" : "bg-gray-50 dark:bg-gray-700"}`}>
                          {currentPage?.image_url ? (
                            <img
                              src={currentPage.image_url}
                              alt={isHebrew ? `עמוד ${currentPageIndex}` : `Page ${currentPageIndex}`}
                              className="w-full h-full object-cover cursor-zoom-in"
                              onClick={zoomIn}
                            />
                          ) : (
                            <div className="w-full h-full min-h-[200px] flex items-center justify-center">
                              <p className="text-gray-400">
                                {isHebrew ? "אין איור" : "No illustration"}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </PageFlip>
              </div>
            </div>

            {/* "The End" celebration section — shown when on the last page */}
            {currentPageIndex === pages.length - 1 && pages.length > 1 && (
              <div className={`px-4 pt-6 pb-2 text-center ${nightBg} transition-colors duration-300`}>
                <div className={`max-w-2xl mx-auto rounded-2xl p-6 shadow-inner ${nightMode ? "bg-gray-900" : "bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20"}`}>
                  <div className="text-4xl mb-2">🎉</div>
                  <h3 className={`text-2xl font-bold mb-1 ${nightMode ? "text-amber-100" : "text-purple-700 dark:text-purple-300"}`}>
                    {currentLanguage === "hebrew" || currentLanguage === "yiddish"
                      ? "סיימת את הספר!"
                      : "You finished the book!"}
                  </h3>
                  <p className={`text-sm mb-5 ${nightMode ? "text-gray-400" : "text-gray-500 dark:text-gray-400"}`}>
                    {isGuest
                      ? (currentLanguage === "hebrew" || currentLanguage === "yiddish"
                        ? "התחבר כדי לצבור XP ולשמור את ההתקדמות שלך"
                        : "Sign in to earn XP and save your progress")
                      : (currentLanguage === "hebrew" || currentLanguage === "yiddish"
                        ? "כל הכבוד! קיבלת +25 XP על הקריאה"
                        : "Great job! You earned +25 XP for reading")
                    }
                  </p>
                  <div className={`flex flex-wrap justify-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
                    {/* Read Again */}
                    <Button
                      variant="outline"
                      onClick={() => {
                        bookReadAwardedRef.current = false;
                        setCurrentPageIndex(0);
                        setDirection(-1);
                      }}
                      className="flex items-center gap-2"
                    >
                      <BookOpen className="h-4 w-4" />
                      {currentLanguage === "hebrew" || currentLanguage === "yiddish"
                        ? "קרא שוב"
                        : "Read Again"}
                    </Button>

                    {/* Sign In prompt for guests, Share for logged-in */}
                    {isGuest ? (
                      <Button
                        onClick={() => navigateToLogin()}
                        className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2"
                      >
                        <LogIn className="h-4 w-4" />
                        {currentLanguage === "hebrew" || currentLanguage === "yiddish"
                          ? "התחבר כדי ליצור ספרים"
                          : "Sign in to create books"}
                      </Button>
                    ) : (
                      <>
                        {/* Share */}
                        <Link to={createPageUrl("Community")}>
                          <Button variant="outline" className="flex items-center gap-2">
                            <Share2 className="h-4 w-4" />
                            {currentLanguage === "hebrew" || currentLanguage === "yiddish"
                              ? "שתף"
                              : "Share"}
                          </Button>
                        </Link>

                        {/* Create New Book */}
                        <Link to={createPageUrl("BookWizard")}>
                          <Button className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            {currentLanguage === "hebrew" || currentLanguage === "yiddish"
                              ? "צור ספר חדש"
                              : "Create New Book"}
                          </Button>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation controls */}
            <div className={`p-4 border-t ${nightNav} transition-colors duration-300`}>
              <div className={`max-w-4xl mx-auto flex justify-between items-center ${isRTL ? "flex-row-reverse" : ""}`}>
                <Button
                  variant="outline"
                  onClick={goToPreviousPage}
                  disabled={currentPageIndex === 0}
                  className="flex items-center gap-2"
                  aria-label={isHebrew ? "הקודם" : "Previous"}
                >
                  {isRTL ? (
                    <>
                      {isHebrew ? "הקודם" : "Previous"}
                      <ChevronRight className="h-4 w-4" aria-hidden="true" />
                    </>
                  ) : (
                    <>
                      <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                      Previous
                    </>
                  )}
                </Button>

                <div className={`text-sm ${nightMode ? "text-gray-400" : "text-gray-500 dark:text-gray-400"}`}>
                  {isHebrew
                    ? `עמוד ${currentPageIndex} מתוך ${pages.length - 1}`
                    : `Page ${currentPageIndex} of ${pages.length - 1}`
                  }
                </div>

                <Button
                  onClick={goToNextPage}
                  disabled={currentPageIndex === pages.length - 1}
                  className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2"
                  aria-label={isHebrew ? "הבא" : "Next"}
                >
                  {isRTL ? (
                    <>
                      <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                      {isHebrew ? "הבא" : "Next"}
                    </>
                  ) : (
                    <>
                      Next
                      <ChevronRight className="h-4 w-4" aria-hidden="true" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center p-8">
              <h2 className={`text-2xl font-bold mb-4 ${nightMode ? "text-amber-50" : "text-gray-900 dark:text-white"}`}>
                {isHebrew ? "הספר לא נמצא" : "Book not found"}
              </h2>
              <p className={`mb-6 ${nightMode ? "text-gray-400" : "text-gray-600 dark:text-gray-300"}`}>
                {isHebrew
                  ? "הספר שחיפשת לא נמצא או הוסר."
                  : "The book you're looking for might have been removed or doesn't exist."
                }
              </p>
              <Link to={createPageUrl("Library")}>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Home className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                  {isHebrew ? "לספרייה" : "Go to Library"}
                </Button>
              </Link>
            </div>
          </div>
        )}
      </main>

    </div>
  );
}
