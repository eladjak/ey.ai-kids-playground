import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useI18n } from "@/components/i18n/i18nProvider";
import { Sparkles, ArrowRight, Lightbulb } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const DailyPromptCard = React.memo(function DailyPromptCard({ dailyPrompt, isPromptLoading }) {
  const { isRTL, t } = useI18n();

  return (
    <section className="p-4 md:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{t("home.dailyPrompt.title")}</h2>

        <Link
          to={createPageUrl("StoryIdeas")}
          className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 flex items-center text-sm font-medium transition-colors"
        >
          {t("home.dailyPrompt.explore")}
          {isRTL
            ? <ArrowRight className="mr-1 h-4 w-4 rotate-180" />
            : <ArrowRight className="ml-1 h-4 w-4" />}
        </Link>
      </div>

      <Card className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/10">
        <CardContent className="p-4 md:p-6">
          {isPromptLoading ? (
            <div className="flex flex-col items-center justify-center h-32">
              <Sparkles className="h-10 w-10 text-amber-300 animate-pulse" />
              <p className="text-amber-700 mt-4">{t("home.dailyPrompt.loading")}</p>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-amber-800 mb-2">
                  {dailyPrompt?.title}
                </h3>
                <p className="text-amber-700 mb-4">
                  {dailyPrompt?.description}
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    to={`${createPageUrl("BookWizard")}?prompt=${encodeURIComponent(JSON.stringify(dailyPrompt))}`}
                    onClick={() => {
                      if (dailyPrompt) {
                        localStorage.setItem("selectedStoryPrompt", JSON.stringify({
                          ...dailyPrompt,
                          source: "daily_prompt"
                        }));
                      }
                    }}
                  >
                    <Button className="bg-amber-500 hover:bg-amber-600 text-white">
                      {t("home.dailyPrompt.use")}
                      {isRTL
                        ? <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
                        : <ArrowRight className="ml-2 h-4 w-4" />}
                    </Button>
                  </Link>

                  <Link
                    to={createPageUrl("StoryIdeas")}
                    onClick={() => {
                      if (dailyPrompt) {
                        localStorage.setItem("lastDailyPrompt", JSON.stringify({
                          ...dailyPrompt,
                          date: new Date().toISOString(),
                          source: "daily_prompt"
                        }));
                      }
                    }}
                  >
                    <Button variant="outline" className="border-amber-200 text-amber-700 hover:bg-amber-100">
                      <Lightbulb className="mr-2 h-4 w-4" />
                      {t("home.dailyPrompt.try")}
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="w-full md:w-1/3 h-32 md:h-40 bg-amber-100 dark:bg-amber-900/20 rounded-lg flex items-center justify-center">
                <Lightbulb className="h-12 w-12 text-amber-300" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
});

export default DailyPromptCard;
