import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useI18n } from "@/components/i18n/i18nProvider";
import { Sparkles, ArrowRight, Lightbulb, Wand2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const DailyPromptCard = React.memo(function DailyPromptCard({ dailyPrompt, isPromptLoading }) {
  const { isRTL, t } = useI18n();

  return (
    <section className="p-4 md:p-6 lg:p-8">
      <div className={`flex justify-between items-center mb-6 ${isRTL ? "flex-row-reverse" : ""}`}>
        <h2 className={`text-2xl font-bold flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-md">
            <Sparkles className="h-4 w-4 text-white" />
          </span>
          {t("home.dailyPrompt.title")}
        </h2>

        <Link
          to={createPageUrl("StoryIdeas")}
          className="text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 flex items-center gap-1 text-sm font-medium transition-colors"
        >
          {t("home.dailyPrompt.explore")}
          {isRTL
            ? <ArrowRight className="h-4 w-4 rotate-180" />
            : <ArrowRight className="h-4 w-4" />}
        </Link>
      </div>

      <Card className="relative overflow-hidden border-0 shadow-xl">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-400 via-orange-400 to-yellow-300 opacity-90" />
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        {/* Sparkle dots */}
        <Sparkles className="absolute top-4 right-8 h-5 w-5 text-white/40" />
        <Sparkles className="absolute bottom-6 left-12 h-4 w-4 text-white/30" />

        <CardContent className="relative p-5 md:p-7">
          {isPromptLoading ? (
            <div className="flex flex-col items-center justify-center h-32" role="status" aria-busy="true">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="h-10 w-10 text-white" aria-hidden="true" />
              </motion.div>
              <p className="text-white font-medium mt-4">{t("home.dailyPrompt.loading")}</p>
            </div>
          ) : (
            <div className={`flex flex-col md:flex-row gap-6 items-center ${isRTL ? "md:flex-row-reverse" : ""}`}>
              <div className={`flex-1 ${isRTL ? "text-right" : "text-left"}`}>
                <h3 className="text-xl md:text-2xl font-bold text-white mb-2 drop-shadow">
                  {dailyPrompt?.title}
                </h3>
                <p className="text-white/90 mb-5 leading-relaxed">
                  {dailyPrompt?.description}
                </p>
                <div className={`flex flex-wrap gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
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
                    <Button className="bg-white text-amber-700 hover:bg-amber-50 shadow-lg font-semibold gap-2">
                      <Wand2 className="h-4 w-4" />
                      {t("home.dailyPrompt.use")}
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
                    <Button variant="outline" className="border-white/60 text-white hover:bg-white/20 backdrop-blur-sm gap-2">
                      <Lightbulb className="h-4 w-4" />
                      {t("home.dailyPrompt.try")}
                    </Button>
                  </Link>
                </div>
              </div>
              {/* Illustration area */}
              <div className="w-full md:w-36 h-32 md:h-36 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-inner flex-shrink-0">
                <motion.div
                  animate={{ y: [-4, 4, -4] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Lightbulb className="h-16 w-16 text-white drop-shadow-lg" />
                </motion.div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
});

export default DailyPromptCard;
