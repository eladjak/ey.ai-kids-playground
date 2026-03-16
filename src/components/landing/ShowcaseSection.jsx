import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/components/i18n/i18nProvider';
import { Link } from 'react-router-dom';

const ShowcaseSection = () => {
  const { t, isRTL } = useI18n();

  const sampleBooks = [
    {
      image: '/images/reading-magic.jpg',
      title: t('landing.showcase.book1Title'),
      genre: t('landing.showcase.book1Genre'),
      color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    },
    {
      image: '/images/story-ideas.jpg',
      title: t('landing.showcase.book2Title'),
      genre: t('landing.showcase.book2Genre'),
      color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
    },
    {
      image: '/images/character-workshop.jpg',
      title: t('landing.showcase.book3Title'),
      genre: t('landing.showcase.book3Genre'),
      color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    },
  ];

  return (
    <section
      className="py-20 sm:py-28 bg-gray-50 dark:bg-gray-900"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
            {t('landing.showcase.sectionTitle')}
          </h2>
          <div className="mx-auto w-24 h-1.5 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 rounded-full mb-6" />
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {t('landing.showcase.sectionSubtitle')}
          </p>
        </motion.div>

        {/* Books grid / horizontal scroll on mobile */}
        <div className="flex gap-6 sm:gap-8 overflow-x-auto pb-4 snap-x snap-mandatory sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0">
          {sampleBooks.map((book, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              whileHover={{ y: -8 }}
              className="min-w-[280px] sm:min-w-0 snap-center group"
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
                {/* Book cover image */}
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img
                    src={book.image}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  {/* Genre badge */}
                  <div className={`absolute top-3 ${isRTL ? 'right-3' : 'left-3'}`}>
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${book.color} backdrop-blur-sm`}>
                      <Sparkles className="h-3 w-3" />
                      {book.genre}
                    </span>
                  </div>
                </div>

                {/* Book info */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                    {book.title}
                  </h3>
                  <Link to="/Community">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-purple-200 text-purple-700 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-300 dark:hover:bg-purple-900/30"
                    >
                      <BookOpen className="h-4 w-4" />
                      {t('landing.showcase.readSample')}
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ShowcaseSection;
