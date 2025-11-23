
import React from 'react';
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  BookOpen,
  ChevronRight,
  PlusCircle // Changed from Plus to PlusCircle as per outline
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// Badge is no longer used in the new card design, can be removed if not used elsewhere in this component
// import { Badge } from "@/components/ui/badge"; 

export default function MyBooksSection({ books = [], currentLanguage = "english", showAll = false }) {
  const translations = {
    english: {
      "myBooks.title": "My Books",
      "myBooks.recent": "Recent Books",
      "myBooks.noBooks": "No books created yet", // Updated key
      "myBooks.startCreating": "Start creating your first book", // Updated key
      "myBooks.createBook": "Create Book", // Updated key
      "myBooks.viewAll": "View All",
      "myBooks.read": "Read", // New translation
      "myBooks.edit": "Edit" // New translation
    },
    hebrew: {
      "myBooks.title": "הספרים שלי",
      "myBooks.recent": "ספרים אחרונים",
      "myBooks.noBooks": "עדיין לא נוצרו ספרים", // Updated key
      "myBooks.startCreating": "התחל ליצור את הספר הראשון שלך", // Updated key
      "myBooks.createBook": "צור ספר", // Updated key
      "myBooks.viewAll": "צפה בהכל",
      "myBooks.read": "קרא", // New translation
      "myBooks.edit": "ערוך" // New translation
    }
  };

  const t = (key) => {
    return translations[currentLanguage]?.[key] || translations.english[key] || key;
  };

  // Removed isRTL, formatDate, getStatusBadgeStyles as they are no longer used in the new design

  const displayBooks = showAll ? books : books.slice(0, 3); // Defined displayBooks here

  return (
    <Card className="h-full"> {/* Removed dir prop as it's not in the outline */}
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0"> {/* Kept existing CardHeader classes */}
        <CardTitle className="text-xl font-bold"> {/* Kept existing CardTitle classes */}
          {showAll ? t("myBooks.title") : t("myBooks.recent")}
        </CardTitle>
        {!showAll && books.length > 3 && ( // Updated condition to books.length > 3
          <Link to={createPageUrl("Library")}>
            <Button variant="ghost" size="sm" className="text-blue-600 dark:text-blue-400"> {/* Kept existing Button classes */}
              {t("myBooks.viewAll")}
              <ChevronRight className="h-4 w-4 ml-1" /> {/* Removed conditional rotation */}
            </Button>
          </Link>
        )}
      </CardHeader>
      <CardContent>
        {displayBooks.length > 0 ? ( // Changed to displayBooks
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"> {/* Updated grid layout */}
            {displayBooks.map((book) => ( // Iterating over displayBooks
              // Removed motion.div wrapper as it's not in the outline
              <Card key={book.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-[3/4] bg-gray-100 dark:bg-gray-800">
                  {book.cover_image ? (
                    <img
                      src={book.cover_image}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="h-12 w-12 text-gray-300" /> {/* Updated icon size/color */}
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h4 className="font-medium truncate">{book.title}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    {book.child_name} {/* Added child_name as per outline */}
                  </p>
                  <div className="flex gap-2">
                    {book.status === 'complete' ? ( // Conditional linking based on status
                      <Link to={`${createPageUrl("BookView")}?id=${book.id}`}> {/* Updated link target */}
                        <Button size="sm" variant="outline" className="text-xs">
                          {t("myBooks.read")}
                        </Button>
                      </Link>
                    ) : (
                      <Link to={`${createPageUrl("BookCreation")}?id=${book.id}`}> {/* Updated link target */}
                        <Button size="sm" variant="outline" className="text-xs">
                          {t("myBooks.edit")}
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" /> {/* Updated margin */}
            <h4 className="text-lg font-medium mb-2">{t("myBooks.noBooks")}</h4> {/* Updated key */}
            <p className="text-gray-500 mb-4">{t("myBooks.startCreating")}</p> {/* Updated key */}
            <Link to={createPageUrl("CreativeStoryStudio")}> {/* Updated link target */}
              <Button>
                <PlusCircle className="h-4 w-4 mr-2" /> {/* Changed icon to PlusCircle */}
                {t("myBooks.createBook")} {/* Updated key */}
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
