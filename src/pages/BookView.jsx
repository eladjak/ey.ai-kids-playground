import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Book } from "@/entities/Book";
import { Page } from "@/entities/Page";
import { createPageUrl } from "@/utils";
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  Bookmark, 
  Download, 
  Share2,
  Home,
  Volume2,
  VolumeX,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export default function BookView() {
  const [book, setBook] = useState(null);
  const [pages, setPages] = useState([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const { toast } = useToast();
  
  // Get book ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const bookId = urlParams.get("id");
  
  useEffect(() => {
    if (!bookId) return;
    
    const loadBook = async () => {
      try {
        setLoading(true);
        const bookData = await Book.get(bookId);
        setBook(bookData);
        
        // Load pages
        const pagesData = await Page.filter({ book_id: bookId }, "page_number");
        setPages(pagesData);
      } catch (error) {
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
  
  const currentPage = pages[currentPageIndex];
  
  const goToNextPage = () => {
    if (currentPageIndex < pages.length - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
    }
  };
  
  const goToPreviousPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
    }
  };
  
  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };
  
  const getPageLayoutStyle = (layoutType) => {
    switch (layoutType) {
      case "text_top":
        return "flex-col";
      case "text_bottom":
        return "flex-col-reverse";
      case "text_left":
        return "flex-row";
      case "text_right":
        return "flex-row-reverse";
      default:
        return "flex-col";
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading book...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <Link to={createPageUrl("Library")}>
              <Button variant="ghost" size="icon" className="mr-2">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              {book?.title || "Book Viewer"}
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleSound}>
              {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            </Button>
            
            <Link to={`${createPageUrl("Feedback")}?id=${bookId}`}>
              <Button variant="ghost" size="icon">
                <MessageSquare className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>
      
      {/* Book content */}
      <main className="flex-1 flex flex-col">
        {book && pages.length > 0 ? (
          <div className="flex-1 flex flex-col">
            {/* Book viewer */}
            <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 bg-gray-100 dark:bg-gray-900">
              <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                {currentPageIndex === 0 ? (
                  // Cover page
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
                          <p className="text-xl text-white opacity-80">A story for {book.child_name}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  // Regular page
                  <div className={`min-h-[60vh] flex ${getPageLayoutStyle(currentPage?.layout_type)}`}>
                    {/* Text content */}
                    <div className="p-6 md:p-8 flex-1 flex items-center">
                      <div>
                        <p className="text-lg md:text-xl text-gray-800 dark:text-gray-200 leading-relaxed">
                          {currentPage?.text_content}
                        </p>
                      </div>
                    </div>
                    
                    {/* Image */}
                    <div className="flex-1 bg-gray-50 dark:bg-gray-700">
                      {currentPage?.image_url ? (
                        <img 
                          src={currentPage.image_url} 
                          alt={`Page ${currentPageIndex}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <p className="text-gray-400">No illustration</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Navigation controls */}
            <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
              <div className="max-w-4xl mx-auto flex justify-between items-center">
                <Button 
                  variant="outline" 
                  onClick={goToPreviousPage}
                  disabled={currentPageIndex === 0}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Page {currentPageIndex} of {pages.length - 1}
                </div>
                
                <Button 
                  onClick={goToNextPage}
                  disabled={currentPageIndex === pages.length - 1}
                  className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Book not found
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                The book you're looking for might have been removed or doesn't exist.
              </p>
              <Link to={createPageUrl("Library")}>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Home className="mr-2 h-4 w-4" />
                  Go to Library
                </Button>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}