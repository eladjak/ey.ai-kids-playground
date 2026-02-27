
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Book } from "@/entities/Book";
import { User } from "@/entities/User";
import {
  PlusCircle,
  Search,
  BookOpen,
  Filter,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import BookCard from "../components/library/BookCard";
import EmptyState from "../components/library/EmptyState";

export default function Library() {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    status: "all",
    genre: "all",
    age_range: "all",
    language: "all"
  });
  const [showFilters, setShowFilters] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState("english");
  
  useEffect(() => {
    const storedLanguage = localStorage.getItem("appLanguage");
    if (storedLanguage) {
      setCurrentLanguage(storedLanguage);
    }
    
    const handleStorageChange = (e) => {
      if (e.key === "appLanguage") {
        setCurrentLanguage(e.newValue || "english");
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const translations = {
    english: {
      "library.title": "My Library",
      "library.subtitle": "View and manage your personalized storybooks",
      "library.createNewBook": "Create New Book",
      "library.search": "Search by title or child's name...",
      "library.filters": "Filters",
      "library.active": "Active",
      "library.reset": "Reset",
      "library.status": "Status",
      "library.allStatus": "All Status",
      "library.draft": "Draft",
      "library.generating": "Generating",
      "library.complete": "Complete",
      "library.genre": "Genre",
      "library.allGenres": "All Genres",
      "library.ageRange": "Age Range",
      "library.allAges": "All Ages",
      "library.language": "Language",
      "library.allLanguages": "All Languages",
      "library.booksFound": "books found",
      "library.bookFound": "book found",
      "library.noBooks": "No books found",
      "library.adjustFilters": "Try adjusting your filters or search terms",
      "library.createFirst": "Create your first personalized storybook",
      "library.createBook": "Create a Book"
    },
    hebrew: {
      "library.title": "הספרייה שלי",
      "library.subtitle": "צפייה וניהול ספרי הסיפורים המותאמים אישית שלך",
      "library.createNewBook": "צור ספר חדש",
      "library.search": "חפש לפי כותרת או שם הילד...",
      "library.filters": "סינון",
      "library.active": "פעיל",
      "library.reset": "איפוס",
      "library.status": "סטטוס",
      "library.allStatus": "כל הסטטוסים",
      "library.draft": "טיוטה",
      "library.generating": "בתהליך יצירה",
      "library.complete": "הושלם",
      "library.genre": "ז'אנר",
      "library.allGenres": "כל הז'אנרים",
      "library.ageRange": "טווח גיל",
      "library.allAges": "כל הגילאים",
      "library.language": "שפה",
      "library.allLanguages": "כל השפות",
      "library.booksFound": "ספרים נמצאו",
      "library.bookFound": "ספר נמצא",
      "library.noBooks": "לא נמצאו ספרים",
      "library.adjustFilters": "נסה להתאים את המסננים או מונחי החיפוש שלך",
      "library.createFirst": "צור את ספר הסיפורים המותאם אישית הראשון שלך",
      "library.createBook": "צור ספר"
    },
    yiddish: {
      "library.title": "מײַן ביבליאָטעק",
      "library.createNewBook": "שאַפֿן אַ נײַ בוך"
    }
  };

  const t = (key) => {
    return translations[currentLanguage]?.[key] || translations.english[key] || key;
  };

  const isRTL = currentLanguage === "hebrew" || currentLanguage === "yiddish";

  useEffect(() => {
    loadBooks();
  }, []);

  useEffect(() => {
    filterBooks();
  }, [books, searchQuery, filters]);

  const loadBooks = async () => {
    try {
      setIsLoading(true);
      const user = await User.me();
      const loadedBooks = await Book.filter({ created_by: user.email });
      setBooks(loadedBooks);
    } catch (error) {
      // silently handled
    } finally {
      setIsLoading(false);
    }
  };

  const filterBooks = () => {
    let results = [...books];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(book => 
        book.title.toLowerCase().includes(query) || 
        book.child_name.toLowerCase().includes(query)
      );
    }

    if (filters.status !== "all") {
      results = results.filter(book => book.status === filters.status);
    }

    if (filters.genre !== "all") {
      results = results.filter(book => book.genre === filters.genre);
    }

    if (filters.age_range !== "all") {
      results = results.filter(book => book.age_range === filters.age_range);
    }

    if (filters.language !== "all") {
      results = results.filter(book => book.language === filters.language);
    }

    setFilteredBooks(results);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      status: "all",
      genre: "all",
      age_range: "all",
      language: "all"
    });
    setSearchQuery("");
  };

  const genreOptions = [
    { value: "all", label: t("library.allGenres") },
    { value: "adventure", label: "Adventure" },
    { value: "fairy_tale", label: "Fairy Tale" },
    { value: "educational", label: "Educational" },
    { value: "bedtime", label: "Bedtime" },
    { value: "fantasy", label: "Fantasy" },
    { value: "science", label: "Science" },
    { value: "animals", label: "Animals" },
    { value: "sports", label: "Sports" }
  ];

  const ageRangeOptions = [
    { value: "all", label: t("library.allAges") },
    { value: "2-4", label: "2-4 years" },
    { value: "5-7", label: "5-7 years" },
    { value: "8-10", label: "8-10 years" },
    { value: "11+", label: "11+ years" }
  ];

  const languageOptions = [
    { value: "all", label: t("library.allLanguages") },
    { value: "english", label: "English" },
    { value: "hebrew", label: "Hebrew" },
    { value: "yiddish", label: "Yiddish" }
  ];

  return (
    <div className="max-w-6xl mx-auto" dir={isRTL ? "rtl" : "ltr"}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t("library.title")}</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            {t("library.subtitle")}
          </p>
        </div>
        <Link to={createPageUrl("CreativeStoryStudio")}>
          <Button className="bg-purple-600 hover:bg-purple-700">
            <PlusCircle className="mr-2 h-4 w-4" />
            {t("library.createNewBook")}
          </Button>
        </Link>
      </div>

      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4`} />
            <Input
              placeholder={t("library.search")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`${isRTL ? 'pr-9' : 'pl-9'} dark:bg-gray-800 dark:border-gray-700 dark:text-white`}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className={`absolute ${isRTL ? 'left-1' : 'right-1'} top-1/2 -translate-y-1/2 h-7 w-7 dark:text-gray-400 dark:hover:text-white`}
                onClick={() => setSearchQuery("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <Button
            variant={showFilters ? "default" : "outline"}
            onClick={() => setShowFilters(!showFilters)}
            className={`${showFilters ? "bg-purple-600 hover:bg-purple-700 text-white" : "dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"}`}
          >
            <Filter className="mr-2 h-4 w-4" />
            {t("library.filters")}
            {(filters.status !== "all" || filters.genre !== "all" || 
              filters.age_range !== "all" || filters.language !== "all") && (
              <Badge variant="secondary" className="ml-2 bg-purple-200 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                {t("library.active")}
              </Badge>
            )}
          </Button>
        </div>

        {showFilters && (
          <Card className="border border-gray-200 dark:border-gray-700 shadow-sm dark:bg-gray-800">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg text-gray-900 dark:text-white">{t("library.filters")}</CardTitle>
                <Button variant="ghost" size="sm" onClick={resetFilters} className="dark:text-gray-300 dark:hover:text-white">
                  {t("library.reset")}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium dark:text-gray-300">{t("library.status")}</label>
                  <Select
                    value={filters.status}
                    onValueChange={(value) => handleFilterChange("status", value)}
                  >
                    <SelectTrigger className="dark:bg-gray-800 dark:border-gray-700">
                      <SelectValue placeholder={t("library.allStatus")} />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                      <SelectItem value="all">{t("library.allStatus")}</SelectItem>
                      <SelectItem value="draft">{t("library.draft")}</SelectItem>
                      <SelectItem value="generating">{t("library.generating")}</SelectItem>
                      <SelectItem value="complete">{t("library.complete")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium dark:text-gray-300">{t("library.genre")}</label>
                  <Select
                    value={filters.genre}
                    onValueChange={(value) => handleFilterChange("genre", value)}
                  >
                    <SelectTrigger className="dark:bg-gray-800 dark:border-gray-700">
                      <SelectValue placeholder={t("library.allGenres")} />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                      {genreOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium dark:text-gray-300">{t("library.ageRange")}</label>
                  <Select
                    value={filters.age_range}
                    onValueChange={(value) => handleFilterChange("age_range", value)}
                  >
                    <SelectTrigger className="dark:bg-gray-800 dark:border-gray-700">
                      <SelectValue placeholder={t("library.allAges")} />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                      {ageRangeOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium dark:text-gray-300">{t("library.language")}</label>
                  <Select
                    value={filters.language}
                    onValueChange={(value) => handleFilterChange("language", value)}
                  >
                    <SelectTrigger className="dark:bg-gray-800 dark:border-gray-700">
                      <SelectValue placeholder={t("library.allLanguages")} />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                      {languageOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Tabs defaultValue="grid" className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {filteredBooks.length} {filteredBooks.length === 1 ? t("library.bookFound") : t("library.booksFound")}
          </div>
          <TabsList>
            <TabsTrigger value="grid">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </TabsTrigger>
            <TabsTrigger value="list">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="grid" className="mt-0">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array(8).fill(0).map((_, index) => (
                <Card key={index} className="overflow-hidden">
                  <div className="aspect-[3/4] bg-gray-100 dark:bg-gray-800">
                    <Skeleton className="h-full w-full" />
                  </div>
                  <CardFooter className="p-4">
                    <div className="space-y-2 w-full">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : filteredBooks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredBooks.map((book) => (
                <BookCard key={book.id} book={book} viewType="grid" />
              ))}
            </div>
          ) : (
            <EmptyState
              title={t("library.noBooks")}
              description={searchQuery || (filters.status !== "all" || filters.genre !== "all" || 
                filters.age_range !== "all" || filters.language !== "all") 
                ? t("library.adjustFilters")
                : t("library.createFirst")
              }
              icon={<BookOpen className="h-12 w-12 text-gray-400" />}
              actionLabel={t("library.createBook")}
              actionLink={createPageUrl("CreativeStoryStudio")}
            />
          )}
        </TabsContent>

        <TabsContent value="list" className="mt-0">
          {isLoading ? (
            <div className="space-y-4">
              {Array(8).fill(0).map((_, index) => (
                <Card key={index} className="overflow-hidden">
                  <div className="flex items-center gap-4 p-4">
                    <Skeleton className="h-16 w-12 rounded" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-4 w-1/4" />
                    </div>
                    <Skeleton className="h-8 w-24 rounded" />
                  </div>
                </Card>
              ))}
            </div>
          ) : filteredBooks.length > 0 ? (
            <div className="space-y-4">
              {filteredBooks.map((book) => (
                <BookCard key={book.id} book={book} viewType="list" />
              ))}
            </div>
          ) : (
            <EmptyState
              title={t("library.noBooks")}
              description={searchQuery || (filters.status !== "all" || filters.genre !== "all" || 
                filters.age_range !== "all" || filters.language !== "all") 
                ? t("library.adjustFilters")
                : t("library.createFirst")
              }
              icon={<BookOpen className="h-12 w-12 text-gray-400" />}
              actionLabel={t("library.createBook")}
              actionLink={createPageUrl("CreativeStoryStudio")}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
