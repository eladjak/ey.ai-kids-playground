import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useI18n } from "@/components/i18n/i18nProvider";
import { BookOpen, Play, PenTool } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

function translateGenre(genre, isRTL) {
  const genreTranslations = {
    "adventure": isRTL ? "הרפתקאה" : "Adventure",
    "fairy_tale": isRTL ? "אגדה" : "Fairy Tale",
    "educational": isRTL ? "חינוכי" : "Educational",
    "bedtime": isRTL ? "סיפור לפני השינה" : "Bedtime",
    "fantasy": isRTL ? "פנטזיה" : "Fantasy",
    "science": isRTL ? "מדע" : "Science",
    "animals": isRTL ? "חיות" : "Animals",
    "sports": isRTL ? "ספורט" : "Sports"
  };
  return genreTranslations[genre] || genre;
}

const FeaturedBooksSection = React.memo(function FeaturedBooksSection({ featuredBooks, recentBooks, isLoading }) {
  const { isRTL, t } = useI18n();
  const [activeTab, setActiveTab] = useState("featured");

  return (
    <section className="p-4 md:p-6 lg:p-8">
      <Tabs defaultValue="featured" onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-2xl font-bold">
            {activeTab === "featured" ? t("home.tabs.featured") : t("home.tabs.recent")}
          </h2>
          <TabsList className="bg-purple-100/50 dark:bg-purple-900/20">
            <TabsTrigger value="featured">{t("home.tabs.featured")}</TabsTrigger>
            <TabsTrigger value="recent">{t("home.tabs.recent")}</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="featured">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              Array(3).fill(0).map((_, index) => (
                <Card key={index} className="overflow-hidden" aria-hidden="true">
                  <Skeleton className="aspect-square w-full" />
                  <CardContent className="p-5 space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <div className="flex justify-between items-center pt-1">
                      <div className="flex gap-2">
                        <Skeleton className="h-5 w-20 rounded-full" />
                        <Skeleton className="h-5 w-14 rounded-full" />
                      </div>
                      <Skeleton className="h-8 w-24 rounded-md" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : featuredBooks.map((book) => (
              <Card key={book.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 h-full">
                <div className="aspect-square bg-gray-100 dark:bg-gray-800">
                  {book.cover_image ? (
                    <img
                      src={book.cover_image}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="h-16 w-16 text-gray-300" />
                    </div>
                  )}
                </div>
                <CardContent className="p-5">
                  <h3 className="font-bold text-lg mb-2">{book.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{book.description}</p>

                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs capitalize">
                        {translateGenre(book.genre, isRTL)}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {book.age_range}
                      </Badge>
                    </div>

                    {book.isSample ? (
                      <Link to={createPageUrl("BookWizard")}>
                        <Button size="sm">
                          <BookOpen className="h-4 w-4 mr-1" />
                          {t("home.create.button")}
                        </Button>
                      </Link>
                    ) : (
                      <Link to={`${createPageUrl("BookView")}?id=${book.id}`}>
                        <Button size="sm">
                          <Play className="h-4 w-4 mr-1" />
                          {t("home.book.read")}
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recent">
          {recentBooks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentBooks.map((book) => (
                <Card key={book.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 h-full">
                  <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-800">
                    {book.cover_image ? (
                      <img
                        src={book.cover_image}
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="h-16 w-16 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-5">
                    <h3 className="font-bold text-lg mb-2">{book.title}</h3>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-xs capitalize">
                          {translateGenre(book.genre, isRTL)}
                        </Badge>
                      </div>
                      <Badge variant="outline" className="text-xs text-gray-500">
                        {book.updated_date && new Date(book.updated_date).toLocaleDateString()}
                      </Badge>
                    </div>

                    <div className="flex justify-between mt-auto">
                      <Link to={`${createPageUrl("BookView")}?id=${book.id}`}>
                        <Button size="sm">
                          <Play className="h-4 w-4 mr-1" />
                          {t("home.book.continue")}
                        </Button>
                      </Link>

                      <Link to={`${createPageUrl("BookCreation")}?id=${book.id}`}>
                        <Button size="sm" variant="outline">
                          <PenTool className="h-4 w-4 mr-1" />
                          {t("home.book.edit")}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-gray-50 dark:bg-gray-800/50 border-dashed">
              <CardContent className="p-8 md:p-12 text-center">
                <BookOpen className="h-12 w-12 md:h-16 md:w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-2">{t("home.noBooks.title")}</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  {t("home.noBooks.subtitle")}
                </p>
                <Link to={createPageUrl("BookWizard")}>
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <PenTool className="h-4 w-4 mr-2" />
                    {t("home.create.button")}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </section>
  );
});

export default FeaturedBooksSection;
