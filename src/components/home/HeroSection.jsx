import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useI18n } from "../../components/i18n/i18nContext";

export default function HeroSection() {
  const { t } = useI18n();
  
  return (
    <section className="py-12 px-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="md:w-1/2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
              {t("home.title")}{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">
                {t("home.subtitle")}
              </span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              {t("home.description")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to={createPageUrl("CreateBook")}>
                <Button size="lg" className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto">
                  {t("home.createBookBtn")}
                </Button>
              </Link>
              <Link to={createPageUrl("Library")}>
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  {t("home.viewLibraryBtn")}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
        <div className="md:w-1/2">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-yellow-300 rounded-full opacity-50 blur-xl"></div>
            <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-purple-400 rounded-full opacity-50 blur-xl"></div>
            <img 
              src="https://images.unsplash.com/photo-1635048424329-a9bfb146d7aa?q=80&w=1600&auto=format&fit=crop" 
              alt="Children reading a magical book" 
              className="rounded-lg shadow-2xl w-full object-cover max-h-[400px]"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}